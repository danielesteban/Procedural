## About the music files...

Just copy/link them inside this folder with the following naming pattern:
```
001.ogg
002.ogg
003.ogg
004.ogg
[...]
```

They must be encoded with the Ogg Vorbis format. You can easily transcode them from any format with [FFmpeg](https://ffmpeg.org/download.html):
```
ffmpeg -i input.mp3 -c:a libvorbis -q:a 4 001.ogg
```
