import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import './App.css';
import 'tachyons';
import Clarifai from 'clarifai';

/* move to back end in order to protect stealing clarifai api key
const app = new Clarifai.App({
 apiKey: '1eb4741cfeea458d84b893862ef2b83e'
});
*/

const particlesOption ={
                  particles: {
                    number:{
                      value:100,
                      density:{
                        enable:true,
                        value_area:800
                      }
                    }
                  }
                }

const initialState = {
  input:'',
  imageUrl:'',
  box:{},
  route:'signin',
  isSignedIn : false,
  user :{
    id:'',
    name:'',
    email:'',
    entries:0,
    joined: ''
  }
}
class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }
/*
  componentDidMount(){
    fetch('http://localhost:3000')
    .then(response=>response.json())
    .then(console.log)
  }
*/
  loadUser = (data) =>{
    this.setState({user:{
      id:data.id,
      name:data.name,
      email:data.email,
      entries:data.entries,
      joined: data.joined

    }

    })
  }

  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height= Number(image.height);
    return {
      leftCol:clarifaiFace.left_col *width,
      topRow:clarifaiFace.top_row*height,
      rightCol:width-(clarifaiFace.right_col*width),
      bottomRow:height-(clarifaiFace.bottom_row*height),

    }
  }

  displayFaceBox = (box) =>{
    console.log(box);
    this.setState({box:box});
  }

  onInputChange = (event) =>{
    console.log(event.target.value);
    this.setState({input:event.target.value})
  }

  onButtonSubmit = () =>{
    this.setState({imageUrl:this.state.input});
    //move to backend part
    //app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    fetch('https://obscure-dawn-88087.herokuapp.com/imageurl',{
      method:'post',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        input:this.state.input
      })
    })
    .then(response => response.json())
    .then(response => {
      if (response){
        fetch('https://obscure-dawn-88087.herokuapp.com:3000/image',{
          method:'put',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            id:this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user,{entries:count}))

        })
        .catch(console.log);

      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err=>console.log(err));
    //console.log(response.outputs[0].data.regions[0].region_info.bounding_box)
  }

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState(initialState)
      //set state back to initialState after sign out. So new user will not get data of previous user.
    }else if (route === 'home'){
      this.setState({isSignedIn:true});
    }
    this.setState({route:route});

  }

  render() {
    const {isSignedIn,box,imageUrl,route,input} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
                params={particlesOption}
              />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {route === 'home'
        ?<div>
        <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries} />
        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
        <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
        :(route ==='register')
        ?<Register loadUser = {this.loadUser} onRouteChange={this.onRouteChange}/>
        :<SignIn loadUser = {this.loadUser} onRouteChange={this.onRouteChange}/>

      }
      </div>
    );
  }
}


export default App;
