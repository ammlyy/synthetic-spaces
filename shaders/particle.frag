uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uMorph;
uniform bool uSunny;
uniform bool uClouds;
uniform bool uRain;


varying vec2 vPUv;
varying float vMorph;

void main() {
    vec4 color = vec4(0.0);
    vec2 puv = vPUv;
    float MULT = 1.5;
    float DIV = 0.65;

    // pixel color
    vec4 colA =  (1.0 - vMorph) * texture2D(uTexture, puv) +  vMorph * texture2D(uTexture2, puv);
    if(uSunny) {
    colA.r = min(255.0, colA.r *  MULT);
    colA.g = min(255.0, colA.g *  MULT);
    colA.b = min(255.0, colA.b * MULT);
    }
    if(uClouds || uRain) {
    colA.r = min(255.0, colA.r * DIV);
    colA.g = min(255.0, colA.g * DIV);
    colA.b = min(255.0, colA.b * DIV);
    }


    gl_FragColor = vec4(colA ) ;
}