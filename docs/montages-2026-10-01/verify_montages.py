import argparse, concurrent.futures, hashlib, io, json, re, struct, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageStat, ImageChops
import numpy as np

p=argparse.ArgumentParser()
p.add_argument('--repo',type=Path,required=True)
p.add_argument('--ffmpeg',type=Path,required=True)
p.add_argument('--sources',type=Path,required=True)
p.add_argument('--output',type=Path,required=True)
p.add_argument('--media',type=Path)
a=p.parse_args()
a.output.mkdir(parents=True,exist_ok=True)
media=a.media or a.repo/'public/media'
names=['hoogbeeldmedia-hero-desktop.mp4','hoogbeeldmedia-hero-desktop.webm','hoogbeeldmedia-hero-mobile.mp4','hoogbeeldmedia-hero-mobile.webm','hoogbeeldmedia-portfolio.mp4']

def run(args):
    return subprocess.run([str(a.ffmpeg),'-hide_banner',*map(str,args)],capture_output=True,check=True)

def frame(file,t,w,h):
    r=run(['-loglevel','error','-ss',t,'-i',file,'-frames:v','1','-vf',f'scale={w}:{h}','-f','image2pipe','-c:v','mjpeg','-'])
    return Image.open(io.BytesIO(r.stdout)).convert('RGB')

def check(name):
    file=media/name
    info=subprocess.run([str(a.ffmpeg),'-hide_banner','-i',str(file)],capture_output=True,text=True).stderr
    h,m,s=map(float,re.search(r'Duration: (\d+):(\d+):([\d.]+)',info).groups())
    duration=h*3600+m*60+s
    width,height=map(int,re.search(r', (\d+)x(\d+)',info).groups())
    target=43.8 if 'portfolio' in name else 20
    expected=(1920,1080) if 'portfolio' in name else (720,1280) if 'mobile' in name else (1280,720)
    assert abs(duration-target)<0.034 and (width,height)==expected,(name,info)
    assert 'Audio:' not in info and '30 fps' in info,(name,info)
    assert 'yuv420p' in info and 'bt709' in info,(name,info)
    decode=run(['-loglevel','error','-xerror','-i',file,'-map','0:v:0','-progress','pipe:1','-f','null','-'])
    frames=int(re.findall(rb'frame=(\d+)',decode.stdout)[-1])
    assert frames==round(target*30),(name,frames)
    rec={'file':name,'bytes':file.stat().st_size,'sha256':hashlib.file_digest(file.open('rb'),'sha256').hexdigest(),'duration_seconds':duration,'width':width,'height':height,'fps':30,'frames':frames,'audio':False,'decode_verified':True,'pixel_format':'yuv420p','color_space':'bt709','codec':'vp9' if file.suffix=='.webm' else 'h264'}
    if file.suffix=='.mp4':
        positions={}
        with file.open('rb') as f:
            while f.tell()<file.stat().st_size:
                at=f.tell();b=f.read(8)
                if len(b)!=8:break
                size,kind=struct.unpack('>I4s',b)
                if size==1:size=struct.unpack('>Q',f.read(8))[0]
                if size==0:break
                positions[kind.decode(errors='replace')]=at
                f.seek(at+size)
        assert positions['moov']<positions['mdat']
        rec['faststart']=True
        mobile='mobile' in name
        tw,th=(180,320) if mobile else (320,180)
        times=list(np.arange(0.2,duration-0.2,1.0))
        cols=5 if mobile else 6
        sheet=Image.new('RGB',(tw*cols,(th+24)*int(np.ceil(len(times)/cols))),'#111820')
        d=ImageDraw.Draw(sheet)
        for i,t in enumerate(times):
            x,y=(i%cols)*tw,(i//cols)*(th+24)
            sheet.paste(frame(file,t,tw,th),(x,y+24));d.text((x+8,y+6),f'{t:.2f}s',fill='white')
        sheet.save(a.output/f'{file.stem}-review.jpg',quality=92)
        if 'hero' in name:
            times=[duration-0.2,duration-0.1,(frames-1)/30-0.0001,0,0.1,0.2]
            sheet=Image.new('RGB',(tw*6,th+24),'#111820');d=ImageDraw.Draw(sheet)
            ends=[]
            for i,t in enumerate(times):
                im=frame(file,t,tw,th);sheet.paste(im,(tw*i,24));d.text((tw*i+5,5),f'{t:.3f}s',fill='white');ends.append(im)
            sheet.save(a.output/f'{file.stem}-loop.jpg',quality=94)
            rec['loop_boundary_rgb_mae_0_255']=float(np.abs(np.array(ends[2],dtype=float)-np.array(ends[3],dtype=float)).mean())
        # Detect unintended black frames; the portfolio's intentional fades are excluded.
        raw=run(['-loglevel','error','-i',file,'-vf','scale=96:54,format=gray','-f','rawvideo','-']).stdout
        gray=np.frombuffer(raw,dtype=np.uint8).reshape((-1,54,96))
        means=gray.mean(axis=(1,2));active=means[15:-21] if 'portfolio' in name else means
        rec['minimum_active_frame_luma']=float(active.min())
        assert active.min()>10,(name,'unexpected black frame')
    print(f'OK {name}: {duration}s, {width}x{height}, {frames} frames',flush=True)
    return rec

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    checks=list(pool.map(check,names))
for name,size in [('hoogbeeldmedia-poster.webp',(1280,720)),('hoogbeeldmedia-hero-mobile-poster.webp',(720,1280)),('hoogbeeldmedia-portfolio-poster.webp',(1920,1080))]:
    path=media/name
    with Image.open(path) as im:
        im.load();assert im.size==size
    checks.append({'file':name,'bytes':path.stat().st_size,'width':size[0],'height':size[1],'sha256':hashlib.file_digest(path.open('rb'),'sha256').hexdigest(),'decode_verified':True})
(a.output/'exports.json').write_text(json.dumps(checks,indent=2)+'\n')
sources=json.loads((a.repo/'docs/montages-2026-10-01/source-checksums.json').read_text())
for rec in sources:
    path=a.sources/rec['file']
    assert path.stat().st_size==rec['bytes']
    actual=hashlib.file_digest(path.open('rb'),'sha256').hexdigest()
    assert actual==rec['sha256'],path.name
    print(f'SOURCE SHA256 OK {path.name}',flush=True)
(a.output/'source-verification.json').write_text(json.dumps({'all_five_sha256_match':True,'sources':sources},indent=2)+'\n')
print('All technical checks passed',flush=True)
