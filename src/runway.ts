import { HostedModel } from '@runwayml/hosted-models'
import { Texture } from 'three'

export class Runway{
private model
private out: any

constructor () {
	this.model = new HostedModel({
		url: "https://midasv2-d4506c32.hosted-models.runwayml.cloud/v1/",
		token: process.env.KEY_RUNWAY,
	})
}

async spec(){ // print out specifics of the model (just for debugging)
    const info = await this.model.info()
    console.log(info)
}

predictDepth(img:Texture): Promise<string>{
	const inputs = {
			"source_imgs": this.convertImage(img), //base 64 image (path or image?!)
			"large": true // use light model? probably faster
		}
    return new Promise((resolve, reject) => {
        this.model.query(inputs).then((out: any) => {
            resolve(out)
        }).catch((err: any) => {
            reject(err)
        })
    })
}

convertImage(tex:Texture) : string{
    const img = tex.image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = tex.image.width
    canvas.height = tex.image.height
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg')
}
}