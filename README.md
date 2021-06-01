# Synthetic Spaces

## Motivation and introduction
**Synthetic spaces** is a project realised for the course of _Creative Programming and Computing_ at the Politecnico of Milano. 
It was born as a reflection on the concept of space, due to pandemic situation and movement restriction. We were interested in the interaction between audio and video, the capability of music to evoke virtual spaces and the power of point clouds in suggestin volumes and shapes. 
Our main inspirations were the work of all those artists who try to connect art and science, in particular those focusing on the point clouds aesthetic (such as [Fuse](https://www.fuseworks.it/) or [Benjamin Bardou](https://benjaminbardou.com/), to name a few).
During the hackhathon, we realised a demo with TouchDesigner and Ableton Live. We then decided to move to a web-application.

## Project specifics
The project is a web-based application, written in HTML, CSS and Typescript. All the code, and the assets, are then bundled through webpack and hosted on a Github Page.

The graphics are rendered in real time using [Three.js](https://github.com/mrdoob/three.js) and some custom shaders written in GLSL and loaded through [Glslify](https://github.com/glslify/glslify).

The audio engine is built using [Tone.js](https://github.com/Tonejs/Tone.js) and runs on top of the rendering animation.

The code was tested on Google Chrome 90.0.4430.93, running at 60fps. We suggest the use of hardware acceleration in Chrome and the use of headphones in order to enjoy the experience as it was conceived.

## Video

## Audio

## Weather
Weather data is retrieved using the [OpenWeatherMap API](https://openweathermap.org/).
Every time the user changes the city, the mode will change accordingly to a table. Both the main melody and the pad chord will be affected by this change.

| Weather       | Mode          | Chord |
| ------------- |:-------------:| :-----:|
| Clear         | Ionian        | maj   |
| Clouds        | Dorian        |   powerchord |
| Rain          | Aeolian       |    min7 |
| Snow          | Myxolidian    |    maj13 |
| Mist          | Phrygian      |    min11 |
| Extreme       | Locrian       |    m7b/b5 |
| Default       | Lydian        |    aug4 |


## User controls
`→` Move to next image

`←` Move to previous image

`wheel`Modify the depth

`mousemove` change camera orientation

`d` trigger special effect 'collapse'

## Considerations



