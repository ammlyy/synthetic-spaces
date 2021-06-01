uniform sampler2D uParticle;

in vec2 Vuv;

void main() {

    vec2 temp = gl_PointCoord - vec2(0.5);
    float f = dot(temp, temp);
    if (f>0.25) discard;

    gl_FragColor = vec4(1.0,1.0,1.0,0.2);

}