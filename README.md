# About

A simple little webapp to help you jump to different parts of a YouTube video with the keyboard. I built this to help me more easily sample from YouTube :) - However perhaps it has some other use.

The code is very sloppy and was built in a few days just enough for me to get it usable for my needs. Feel free to improve it!

# Running

`yarn start`

# Usage

1. Supply a YouTube API key
2. Copy the URL to a public or unlisted playlist and put it into the Playlist URL field, hit 'Refresh' to load it.
3. Click on a video in the Playlist to pull it up on the right-hand side.
4. Use the keyboard to bookmark parts of a video:

- Press the `1` to `0` keys to jump to parts of the video (`1` = 10%, `2` = 20%, etc)
- Use the `Q` to `\` keys, `A` to `'` keys and `Z` to `/` keys to jump to parts of the video (`Q` = 0%, `W` = 1/34, `E` = 2/34, ..., `/` = 100%). These keys provide more points to jump into a video than the number rows.
- Press the tilde (`~`) key to bookmark the last key you pressed. (You can click on the bookmarks that are displayed to jump to that portion of the video).
- Press the `+` or `-` buttons to "nudge" the timecode of the last key you pressed up or down by 0.1 seconds at a time. Hold down shift to jump by 1 second at a time.
- Spacebar pauses and plays the video.

Videos with bookmarks defined will be prefixed with a ⭐. Use the ⭐ filter to only show videos you've previously bookmarked.

> NOTE: Once a playlist has been loaded it is kept in local memory to avoid hitting the YouTube API unnecessarily. If you add or update the playlist click 'Refresh' to pull down new videos.

# Importing / Exporting

All data in the app is kept locally. To copy your playlist and bookmarks click on the Export button, then copy the text displayed on the screen. On another machine click on Import, then paste in the text you copied.
