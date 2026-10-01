"""Render two edits using only the five shared original recordings.

Usage: python render_montages.py --sources PATH --output PATH --ffmpeg PATH
The source files are intentionally not stored in Git (3.6 GB total).
"""
import argparse, concurrent.futures, hashlib, json, subprocess
from pathlib import Path

p=argparse.ArgumentParser()
p.add_argument('--sources',type=Path,required=True)
p.add_argument('--output',type=Path,required=True)
p.add_argument('--ffmpeg',type=Path,required=True)
p.add_argument('--scratch',type=Path,required=True)
p.add_argument('--only',choices=['all','hero','showreel'],default='all')
a=p.parse_args()
a.output.mkdir(parents=True,exist_ok=True)
a.scratch.mkdir(parents=True,exist_ok=True)
files=['20260924_170800000_iOS.MP4','20260924_170936000_iOS.MP4','20260926_125304000_iOS.MP4','20260927_133236000_iOS.MP4','20260927_132738000_iOS.MP4']
# file index, source in-point (seconds), 9:16 horizontal crop center (fraction)
hero=[(2,27.5,0.66),(1,48.5,0.50),(0,15,0.54),(2,53.5,0.50),(1,65,0.55)]
# The two 27 September recordings pan continuously and are deliberately omitted.
# Every included source range is a calm hold or a slow, even ascent.
showreel=[(1,39,0.55),(2,27.5,0.66),(0,15,0.54),(1,48.5,0.50),(2,53.5,0.50),(1,65,0.55),(0,26.5,0.46),(1,57.5,0.52)]
plan={'hero':{'shot_seconds':4.6,'transition_seconds':0.6,'duration_seconds':20,'shots':hero},'showreel':{'shot_seconds':6.0,'transition_seconds':0.6,'duration_seconds':43.8,'shots':showreel},'source_files':files,'speed':0.5,'fps':30,'audio':False,'selection':'stable-holds-v2','excluded_files':files[3:]}
(a.scratch/'edit-plan.json').write_text(json.dumps(plan,indent=2))
def run(args,label):
    result=subprocess.run([str(a.ffmpeg),'-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True,text=True)
    if result.returncode: raise RuntimeError(f'{label}: {result.stderr}')
    print(label,flush=True)
def segment(job):
    kind,i,shot,seconds=job
    source,start,crop=shot
    portrait=kind=='hero-mobile'
    vf='setpts=2*(PTS-STARTPTS),fps=30,'
    vf+=f'crop=ih*9/16:ih:(iw-ih*9/16)*{(crop-0.1582)/0.6836:.6f}:0,scale=720:1280' if portrait else 'scale=1920:1080'
    vf+=',setsar=1,eq=contrast=1.025:saturation=1.04:gamma=1.025,format=yuv420p'
    out=a.scratch/f'stable-v2-{kind}-{i:02}.mp4'
    if out.exists() and out.stat().st_size > 1000:
        return out
    run(['-threads','4','-ss',start,'-i',a.sources/files[source],'-map','0:v:0','-an','-sn','-dn','-vf',vf,'-t',seconds,'-c:v','libx264','-preset','fast','-crf','17','-threads','4','-map_metadata','-1',out],f'Shot {kind} {i+1}')
    return out
def montage(kind,shots,seconds,loop=False):
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        segments=list(pool.map(segment,[(kind,i,s,seconds) for i,s in enumerate(shots)]))
    if loop: segments.append(segments[0])
    inputs=[]
    filters=[]
    for i,s in enumerate(segments):
        inputs+=['-i',s]
        filters.append(f'[{i}:v]settb=AVTB,setpts=PTS-STARTPTS,fps=30[v{i}]')
    previous='v0'
    for i in range(1,len(segments)):
        name=f'x{i}'
        filters.append(f'[{previous}][v{i}]xfade=transition=fade:duration=0.6:offset={(seconds-0.6)*i:.3f},fps=30[{name}]')
        previous=name
    total=20 if loop else len(shots)*seconds-(len(shots)-1)*0.6
    filters.append(f'[{previous}]trim=start={0.6 if loop else 0}:duration={total:.3f},setpts=PTS-STARTPTS'+('' if loop else f',fade=t=in:st=0:d=0.4,fade=t=out:st={total-0.6:.3f}:d=0.6')+(',scale=1280:720' if kind=='hero-desktop' else '')+f',fps=30,tpad=stop_mode=clone:stop_duration=0.1,trim=end_frame={round(total*30)},setpts=N/(30*TB),format=yuv420p[out]')
    out=a.output/('hoogbeeldmedia-portfolio.mp4' if kind=='showreel' else f'hoogbeeldmedia-{kind}.mp4')
    bitrate=['-maxrate','2000k' if kind=='hero-desktop' else '1500k','-bufsize','4000k' if kind=='hero-desktop' else '3000k'] if loop else ['-maxrate','6000k','-bufsize','12000k']
    run([*inputs,'-filter_complex_threads','2','-filter_complex',';'.join(filters),'-map','[out]','-an','-c:v','libx264','-crf','25' if loop else '21',*bitrate,'-preset','slow','-threads','6','-profile:v','high','-level:v','4.0','-pix_fmt','yuv420p','-r','30','-fps_mode','cfr','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart','-map_metadata','-1',out],f'Export {out.name}')
    if loop:
        run(['-i',out,'-map','0:v:0','-an','-c:v','libvpx-vp9','-crf','36','-b:v','0','-deadline','good','-cpu-used','3','-row-mt','1','-threads','6','-map_metadata','-1',out.with_suffix('.webm')],f'WebM {kind}')
    return out
posters=[]
if a.only in ['all','hero']:
    desktop=montage('hero-desktop',hero,4.6,True)
    mobile=montage('hero-mobile',hero,4.6,True)
    posters += [(desktop,'hoogbeeldmedia-poster.webp',0),(mobile,'hoogbeeldmedia-hero-mobile-poster.webp',0)]
if a.only in ['all','showreel']:
    portfolio=montage('showreel',showreel,6.0)
    posters += [(portfolio,'hoogbeeldmedia-portfolio-poster.webp',1)]
for video,name,second in posters:
    run(['-ss',second,'-i',video,'-frames:v','1','-c:v','libwebp','-quality','88',a.output/name],f'Poster {name}')
print('Completed all exports',flush=True)
