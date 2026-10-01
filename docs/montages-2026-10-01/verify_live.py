import argparse,hashlib,json,urllib.request
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--base',required=True);p.add_argument('--exports',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
results=[]
for record in json.loads(a.exports.read_text()):
    url=a.base.rstrip('/')+'/media/'+record['file']+'?v=20261001'
    with urllib.request.urlopen(url,timeout=30) as response:
        h=hashlib.sha256();total=0
        while block:=response.read(1024*1024):h.update(block);total+=len(block)
        content_type=response.headers.get('Content-Type');status=response.status
    assert status==200 and total==record['bytes'] and h.hexdigest()==record['sha256'],record['file']
    row={'file':record['file'],'bytes':total,'sha256':h.hexdigest(),'http_status':status,'content_type':content_type,'matches_verified_export':True}
    if record['file'].endswith('.mp4'):
        req=urllib.request.Request(url,headers={'Range':'bytes=0-1023'})
        with urllib.request.urlopen(req,timeout=30) as response:
            assert response.status==206 and len(response.read())==1024
            row['range_status']=response.status;row['content_range']=response.headers.get('Content-Range')
    results.append(row);print(f'LIVE SHA256 OK {record["file"]}',flush=True)
with urllib.request.urlopen(a.base.rstrip('/')+'/api/health',timeout=30) as response:
    assert response.status==200;health=json.load(response)
a.output.parent.mkdir(parents=True,exist_ok=True)
a.output.write_text(json.dumps({'base':a.base,'all_exports_match':True,'health':health,'files':results},indent=2)+'\n')
