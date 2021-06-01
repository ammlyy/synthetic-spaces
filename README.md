# Synthetic Spaces
**Synthetic Spaces** is a web app installation born as a reflection on the concept of space; a concept that has played a fundamental role in the recent pandemic situation due to the movement restrictions.
We were interested in exploring the audio and visual interaction, the capability of music to evoke virtual spaces and the power of point clouds in suggesting volumes and shapes. 

Our main inspirations were the work of all those artists who try to connect art and science, in particular those focusing on the point clouds aesthetic (such as [Fuse](https://www.fuseworks.it/) or [Benjamin Bardou](https://benjaminbardou.com/), to name a few).

The project was born during the *Creative Programming and Computing 2020 Hackaton* and was initially thought (and prototyped) as a physical installation, realized with different tools such as TouchDesigner and Ableton Live. We then decided, coherently with the underlying motivation, to move to a web application in order to make the experience accessible to everyone.

## Project specifics
The project is a web-based application, written in HTML, CSS and Typescript. All the code, and the assets, are then bundled through webpack and hosted on a Github Page.

The graphics are rendered in real time using [Three.js](https://github.com/mrdoob/three.js) and some custom shaders written in GLSL and loaded through [Glslify](https://github.com/glslify/glslify).

The audio engine is built using [Tone.js](https://github.com/Tonejs/Tone.js) and runs on top of the rendering animation.


## How to use?
The code was tested on Google Chrome 90.0.4430.93, running at 60fps. Also other Chromium based browsers such as Edge and Opera worked fine.
We suggest the use of hardware acceleration in Chrome and the use of headphones in order to enjoy the experience as it was conceived.

`SPACEBAR` start 

`→` Move to next city

`←` Move to previous city

_(To manually select the city you can use the menu accessible by passing over the drawer at the bottom)_

`wheel` Modify the depth

`mousemove` change camera orientation

`d` trigger special effect 'collapse'/


## Visual

Depth estimation has been an important field of research in the last years for its applications in the field of AR, autonomous drive and 3D scene reconstruction.
Our idea was to create a virtual 3D scene starting from a 2D image.
The initial menu contains an interactive text with the title of the project, a start button and a pop-up section about with a minimal description of the project.
On window load, all the images are loaded through webpack and the first image is passed to the shader and rendered.

We associated each image to a grid where every pixel is represented by a point with its color. The point z-position was then added by sampling a depth map loaded as a texture.
All the depth maps were retrieved using the [MiDaS Network](https://github.com/intel-isl/MiDaS), developed by Intel and hosted on TorchHub.

This is an example of a depth map obtained from a picture:

![depth](./readme/depth_example.png)

The scene contains a Mesh, made of (_width * height_) points. 
Each point has as attributes its (x,y,z) coordinates and its random generated normal directions, that are used later to animate the transition.
The material applied onto the mesh is a custom shader material that we specifically wrote in GLSL.
The shader is composed by a vertex shader, applied equally to each vertex in the mesh and a fragment shader, responsible of the coloring of the scene after the rasterization of the vertices.
Since the same code is applied to each vertex by the GPU, we could not access directly to time varying variables. For this reason, we created a set of uniforms that are changed at run time by the CPU and are then passed to the shader.
This way we could control and modify the point cloud as time passes by changing the uniforms that the shader can read.

In order to change image, the shader needs to move smoothly from one image to another. When the animation is triggered, a timer starts and the transition is created by ramping through a double exponential function that starting from 0 spreads the points along their normal directions until a maximum is reached, and then saturates to 1. This way we can interpolate between the images using the _mix()_ function in webGL, that allowed us to move from image at position 0 and image at position 1.
When the user changes again the image, the image that was at index 1 goes at index 0 and the timer is reset.
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


## Interactions 

The weather also affects the point cloud.

| Weather       | Effect        |
| ------------- |:-------------:|
| Clear         | Brighten      |
| Clouds        | Darken        |
| Rain          | Drops + Darken|
| Extreme       | Collapse      |
| Default       | Nothing       |

The effects are applied in the shader.

- Brighten: multiply each pixel by a certain value.

- Darken: divide each pixel by a certain value.

- Drops: random pixels increase their dimension as if they were hit by a rain drop.

- Collapse: since the extreme state is associated to catastrophical events such as earthquakes, we mapped it to the locrian mode (notably the most dissonant). Also the point cloud will "collapse" while a frequency shifter is applied to the whole audio stream. This weather condition is extremely rare, so the user can activate it manually using the `d` key.

User can rotate the camera with the mouse. This orientation will also affect the panning of the audio, as if the speaker was oriented together with the center of the point cloud and moving consequently.

## Considerations

### Known issues
As far as we know, Safari is not supported.

## Run on your machine
Requirements: Node.js and an active account with an API access key to OpenWeatherMap. 



- Clone the repo
- Create a .env file with the following format: `KEY_WEATHER = ' ... '`
- Run npm install ....
- Run npm start and build on your local host
