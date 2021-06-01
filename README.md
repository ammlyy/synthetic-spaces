# Synthetic Spaces
**Synthetic Spaces** is a web app installation born as a reflection on the concept of space; a concept that has played a fundamental role in the recent pandemic situation due to the movement restrictions.
We were interested in exploring the audio and visual interaction, the capability of music to evoke virtual spaces and the power of point clouds in suggesting volumes and shapes. 

Our main inspirations were the work of all those artists who try to connect art and science, in particular those focusing on the point clouds aesthetic (such as [Fuse](https://www.fuseworks.it/) or [Benjamin Bardou](https://benjaminbardou.com/), to name a few).

The project was born during the *Creative Programming and Computing 2020 Hackaton* and was initially thought (and prototyped) as a physical installation, realized with different tools such as TouchDesigner and Ableton Live. We then decided, coherently with the underlying motivation, to move to a web application in order to make the experience accessible to everyone.

## Project specifics
The project is a web-based application, written in HTML, CSS and Typescript. All the code, and the assets, are then bundled through webpack and hosted on a Github Page.

The graphics are rendered in real time using [Three.js](https://github.com/mrdoob/three.js) and some custom shaders written in GLSL and loaded through [Glslify](https://github.com/glslify/glslify).

The audio engine is built using [Tone.js](https://github.com/Tonejs/Tone.js) and runs on top of the rendering animation.

The code was tested on Google Chrome 90.0.4430.93, running at 60fps. Also other Chromium based browsers such as Edge and Opera worked fine.
We suggest the use of hardware acceleration in Chrome and the use of headphones in order to enjoy the experience as it was conceived.

## Video
Depth estimation has been an important field of research in the last years for its applications in the field of AR, autonomous drive and 3D scene reconstruction.
Our idea was to create a virtual 3D scene starting from a 2D image.

We associated each image to a grid where every pixel was represented by a point with its color. The point depth was then added by sampling a depth map loaded as a texture. 
All the depth maps were retrieved using the [MiDaS Network](https://github.com/intel-isl/MiDaS), developed by Intel and hosted on TorchHub. 

This is an example of a depth map obtained from a picture:

![depth](./readme/depth_example.png)

The scene contains a Mesh, made of _width * height_ points. The material is a custom shader material that we wrote in GLSL. 
The shader is composed by a vertex shader, that is applied equally to each vertex in the mesh and a fragment shader, responsible of the coloring of the scene after the rasterization of the vertices.
Since the same code is applied to each vertex by the GPU, we created a set of uniforms that are changed by the CPU and are then passed to the shader. This way we could control and modify the point cloud as time passes.

In order to change image, we had to keep always two images loaded and the transition is applied by ramping through a double exponential function that starting from 0 spreads the points along their normal directions until a maximum is reached, and then saturates to 1. This way we can interpolate between the images using the _mix()_ function in webGL. 
## Audio
The rhythmic skeleton of the music is based on a simple grammar, where "0"s correspond to pauses and "1"s to note triggers. 
The various components use this mechanism to decide when to play, even if they are looping at different speeds.

An audio source is an abstract class which is implemented into three different child classes:
- Pad: a PolySynth object from Tone.js, 4 voices are played simultaneously, and then random voices are spread among diferent octaves to make it less static.
- Sparse Notes: a mono-synth with a triangle oscillator. The initial melody is hard-coded but its rhythmic structure follows a genetic algorithm. The cost function is _"be as similiar as possible to Steve Reich's 'Electric Counterpoint' main theme"_.

<p align="center">
  <img src="./readme/counterpoint.png" />
</p>
- Noise generator: Contains two samplers and a granular player. The sounds were created by us in Ableton Live and then sequenced according to the grammar.


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



