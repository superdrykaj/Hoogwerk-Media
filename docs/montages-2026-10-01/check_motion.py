import argparse, importlib.util, sys, subprocess, json
from pathlib import Path
import numpy as np

p=argparse.ArgumentParser();p.add_argument('--media',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--ffmpeg',type=Path,required=True);p.add_argument('--cv2-path',type=Path);a=p.parse_args()
if a.cv2_path:
    cvpath=a.cv2_path/'__init__.py'
    spec=importlib.util.spec_from_file_location('cv2',cvpath,submodule_search_locations=[str(cvpath.parent)])
    cv2=importlib.util.module_from_spec(spec);sys.modules['cv2']=cv2;spec.loader.exec_module(cv2)
else:
    import cv2
ff=a.ffmpeg
records=[]
for name in ['hoogbeeldmedia-hero-desktop.mp4','hoogbeeldmedia-hero-mobile.mp4','hoogbeeldmedia-portfolio.mp4']:
    portrait='mobile' in name; w,h=(270,480) if portrait else (480,270)
    r=subprocess.run([str(ff),'-hide_banner','-loglevel','error','-i',str(a.media/name),'-vf',f'scale={w}:{h},format=gray','-fps_mode','passthrough','-f','rawvideo','-'],capture_output=True,check=True)
    frames=np.frombuffer(r.stdout,dtype=np.uint8).reshape((-1,h,w))
    values=[];boundary=None
    pairs=[(i,i+1) for i in range(len(frames)-1)]
    if 'hero' in name:pairs.append((len(frames)-1,0))
    for i,j in pairs:
        t=i/30
        if j:
            if 'hero' in name and any(s-0.07<=t<=s+0.67 for s in [3.4,7.4,11.4,15.4,19.4]):continue
            if 'portfolio' in name and (t<0.5 or t>43.1 or any(s-0.07<=t<=s+0.67 for s in [5.4*k for k in range(1,8)])):continue
        mask=np.zeros((h,w),np.uint8);mask[int(h*.23):int(h*.89),int(w*.05):int(w*.95)]=255
        points=cv2.goodFeaturesToTrack(frames[i],250,0.015,5,mask=mask)
        if points is None or len(points)<10:raise RuntimeError((name,t,'too few features'))
        tracked,status,_=cv2.calcOpticalFlowPyrLK(frames[i],frames[j],points,None,winSize=(21,21),maxLevel=3)
        good=status.ravel()==1
        matrix,inliers=cv2.estimateAffinePartial2D(points[good],tracked[good],method=cv2.RANSAC,ransacReprojThreshold=1)
        if matrix is None:raise RuntimeError((name,t,'no transform'))
        center=np.array([w/2,h/2]);delta=matrix[:,:2]@center+matrix[:,2]-center
        roll=float(np.degrees(np.arctan2(matrix[1,0],matrix[0,0])))
        row={'time':round(t,4),'dx_px':float(delta[0]),'dy_px':float(delta[1]),'step_width_fraction':float(np.linalg.norm(delta)/w),'roll_degrees':roll,'inlier_fraction':float(inliers.mean())}
        if j==0:boundary=row
        else:values.append(row)
    steps=np.array([v['step_width_fraction'] for v in values]);rolls=np.abs([v['roll_degrees'] for v in values])
    rec={'file':name,'method':'Full-rate 30 fps sparse optical flow, robust affine fit; intentional dissolves/fades excluded','frames_analyzed':len(values),'maximum_camera_step_pct_width':float(steps.max()*100),'p95_camera_step_pct_width':float(np.percentile(steps,95)*100),'maximum_roll_degrees_per_frame':float(rolls.max()),'largest_step_at_seconds':values[int(steps.argmax())]['time'],'loop_boundary':boundary,'samples':values}
    records.append(rec)
    print(json.dumps({k:v for k,v in rec.items() if k!='samples'}),flush=True)
a.output.write_text(json.dumps(records,indent=2)+'\n')
