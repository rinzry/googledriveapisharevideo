## Automatically Share Videos with Google Drive API
This script will automatically make all videos in a Drive or Shared drive and output links to a log file `logs.log`. It will share **all video files** in the drive/shared drive that are **at least one hour old** as this is an approximate time for drive to process the video.
**Requirements**: This script requires nodeJS to be installed on the machine.
### Installation
To install, run `npm install` in the directory containing the files and this will install all the needed dependencies.
The log file can be configured inside index.js on line 8 by changine the `filename` attribute.

Before running, you will need to add the driveId to `line 86` if using a shared drive. For a shared drive, navigate to that shared drive on drive.google.com and the driveId will be after *folders*:
<code><span>htt</span>ps://drive.google<span>.com</span>/drive/u/*id*/folders/*driveId*</code>

If not using a shared drive, remove the lines with `driveId` and `corpora` (lines 85 and 86)

Follow Step 1 at https://developers.google.com/drive/api/v3/quickstart/nodejs#step_1_turn_on_the to obtain the credentials.json file and copy that file to the folder with index.js

### Usage
You can now run the file with `node .` Upon the first run, it will ask to authorise the application by heading to a link. Visit the link, log in with your google account and then copy and paste the code it gives you into the console and press enter. Now the script will run and enable share with anyone permissions to all video files **at least an hour old** and output the links to those files in logs.log.
