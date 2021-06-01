precision highp float;

uniform vec3 uPos;
uniform float uTimeT;
uniform sampler2D uParticle;

#pragma glslify: noiz = require(glsl-noise/simplex/2d)

void main() {
    vec3 displacement = position;
    float dist =  distance(position, uPos);

    float area = 1. - smoothstep(0., 500., dist);

    if(uTimeT >= 0.){
        displacement.z += 0.7 * area * min(uTimeT, 250.);
    }

    vec4 mvPosition =  modelViewMatrix * vec4( displacement, 1.0 );
    gl_PointSize = 3.0;
    gl_Position = projectionMatrix * mvPosition ;
    
}