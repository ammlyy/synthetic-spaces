precision highp float;

uniform float uRandom;
uniform float uSize;
uniform float uZ;
uniform sampler2D uDepth;
uniform sampler2D uDepth2;
uniform float uMorph;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uTime;
uniform bool uDestroy;
uniform bool uAnimate;
uniform bool uRain;
uniform bool uSunny;

#pragma glslify: noiz = require(glsl-noise/simplex/2d)

out vec2 vPUv;
out float vMorph;


float turbulence();

float turbulence( vec3 p ) {

  float w = 100.0;
  float t = -.5;

  for (float f = 1.0 ; f <= 5.0 ; f++ ){
    float power = pow( 2.0, f );
    t += abs( noiz(vec2( power * p.xy )) / power );
  }

  return t;

}

void main() {
    vec2 puv = position.xy / uTextureSize;
	vPUv = puv;
	vMorph = 0.0;
	// final position
	vec3 displacement;
	displacement = position;
	
	if (!uDestroy)
	{
	float animationTime = 300.0;
		if(uTime < animationTime){
		float exp_ = exp(uTime / 30.);
		displacement.x += exp_ * normal.x;
		displacement.y += exp_ * normal.y;
		displacement.z +=  exp_ *normal.z;
		}
	   else if(uTime >= animationTime) {
		float exp_ = 1.0 + exp( - (uTime - 2.*animationTime)/30.0);
		displacement.x += exp_ *normal.x;
		displacement.y +=  exp_ *normal.y;
		displacement.z +=  exp_ *normal.z;
		vMorph = clamp(exp_, 0., 1.);
	   }
	}
	else{
		vMorph = 1.0;
	}
	
	
	vec4 zoff = mix(texture2D(uDepth, puv), texture2D(uDepth2, puv), vMorph);
	float val = zoff.r * 0.21 + zoff.g * 0.71 + zoff.b * 0.07; // convert to greyscale
	displacement.z += val * uZ * uTextureSize.x +  uRandom*10.* turbulence(displacement);
	displacement.xy -= uTextureSize * 0.5; // centering 

	vec4 age = texture2D(uTexture,puv);

	if(uDestroy){
	displacement.y -= float(uDestroy) * ( uTime * (age.r * 0.21 + age.g * 0.71 + age.b * 0.07) ) ;
	displacement.y = max(-800., displacement.y);
	}

	
	vec3 mvPosition = displacement;	
	vec4 finalPosition = projectionMatrix * modelViewMatrix * vec4(mvPosition, 1.0);

	gl_Position = finalPosition;

	float randSize = 0.0;

	if(uRain) {
		float scaledTime = uTime * 0.001;
		float var = noiz(vec2( (scaledTime + displacement.x) / scaledTime, (scaledTime + displacement.z) / scaledTime));
		if (var >= 0.8){
			randSize = var * 3.;

		}
	}
	gl_PointSize = uSize + randSize ;
	
}
