
const API_KEY_WEATHER = "10082cbf006e2c41c9d1a90cfa631624"

const cities = ['Tokyo', 'London', 'Marrakech' , 'Lisboa', 'Havana', 'Barcelona', 'Venice', 'Mexico City']

export class Data {
    private xhr: XMLHttpRequest
    private weatherData:string[] = []


    constructor() {}

    setCity(city: string) {
        this.xhr.open('GET',
            "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + API_KEY_WEATHER)
    }

    getCityName(index: number) {
        return cities[index % cities.length].toUpperCase()
    }

    async loadWeather(city:string | void):Promise<string> {

        return new Promise((resolve, reject) => {
            this.xhr = new XMLHttpRequest()

            if (city) this.setCity(city)
            this.xhr.onload = () => {
                var obj = JSON.parse(this.xhr.response).weather[0].main
                resolve(obj)

            }
            this.xhr.onerror = () => reject(this.xhr.statusText)
            this.xhr.send()
        });

    }

    async initWeather(){
        for (var city of cities){
            await this.loadWeather(city).then( (response) => {
                this.weatherData.push(response)
            })
        }
    }

    weatherOf(index:number):string{
       return this.weatherData[index % cities.length]
    }
}
