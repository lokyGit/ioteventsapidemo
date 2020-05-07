import _ from 'lodash';
import React, { Component } from 'react';
import logo from './logo.svg';
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify';
import './App.css';
import awsmobile from './aws-exports';
import { render } from "react-dom";
import { Bootstrap } from 'a-theme-react';
import delay from 'delay'

import { AmplifyAuthenticator, withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

import { Button, Input, List, Label, Icon, Form, Grid, Header, Image, Message, Segment, Dropdown } from 'semantic-ui-react'


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      isFetchingDetectors: false,
      value: [],
      options: [],
      template: [],
      modelname: "",
      topic: "",
      timeout: 0,
      viewmodelname: [],
      modelUniqueId: [],
      detectorinstances: [],
      deletemodelname: [],
      addmessagevisible: false,
      addmessagestring: "",
      addmessageresult: true,
      removemessageresult: true,
      removemessagestring: "",
      removemessagevisible: false
    }
  }
  
  // Change Events
  handleChange = (e, { value }) => {
  this.setState({value: value })
  }
  
  handleTemplateChange = (e, { value }) => {
  this.setState({ template: value })
  }
  
  handleTopicChange = (e, { value }) => {
  this.setState({ topic: value })
  }
  
  handleModelNameChange = (e, { value }) => {
  this.setState({ modelname: value})
  }
  
  handleTimeoutChange = (e, { value }) => {
  this.setState({ timeout: value })
  }
  
  handleEventModelChange = (e, { value }) => {
    this.setState({ viewmodelname: value})
    this.loadDetectorInstances(value);
  }
  
  handleEventModelIdChange = (e, { value }) => {
  this.setState({ modelUniqueId: value})
  }
  
  handleClickRefresh = (e, { value }) => {
    this.loadDetectorInstances(this.state.viewmodelname);
  }
  
  handleEventModelRemoveChange = (e, { value }) => {
    this.setState({ deletemodelname: value})
  }
  
  handleClickRemove = (e, { value }) => {
    this.removeEventModel(this.state.deletemodelname);
  }
  
  
  // Load list of Event Detectors into dropdowns.
  async loadEvents() {
   const path = "/iotevents/list"; // you can specify the path
    try{
      const apiResponse = await API.get("api75996003" , path);
      this.setState({ options: apiResponse.options });
      this.setState({isFetching: false});
    }catch(err){
      console.log("error calling api: " + err);
    }
  }


  // Load instances of Event Detectors into dropdown.
  async loadDetectorInstances(value) {
  try{    
    this.setState({isFetchingDetectors: true});
   const path = "/iotevents/detectors"; // you can specify the path
   const params = {
      "viewmodelname": value
   }
   console.log(params);
   const myInit = {
    "body": params
    };
    const apiResponse = await API.put("api75996003" , path, myInit);
    this.setState({ detectorinstances: apiResponse.options });
  }catch(err){
    console.log("error calling loaddetectorinstances: "+ err);
  }
    this.setState({isFetchingDetectors: false});

  }


  // Click Event to add new model. Only works with Simple Alarm for now. 
  // Provides custom parameters which are passed to the API in API Gateway
  handleClickAdd = async ()  => {
    try{
    console.log("Adding now...")
     const path = "/iotevents/add"; // you can specify the path
     console.log(this.state.topic)
     const params = {
        "template": this.state.template,
        "topic":  this.state.topic,
        "timeout":  this.state.timeout,
        "modelname":  this.state.modelname
     }
     console.log(params);
     const myInit = {
      "body": params
      };
      const apiResponse = await API.put("api75996003" , path, myInit);
      console.log(apiResponse.result)
      if(apiResponse.result == true){
        this.showAddMessage(apiResponse.result, "The Event Detector Model was created successfully")
      }
      else{
        this.showAddMessage(apiResponse.result, apiResponse.errormessage)
      }
      console.log('response:' + apiResponse);
    }catch(err){
      this.showAddMessage(false, err.message);  
    }
  }

  async showAddMessage(result, message){
    this.setState({addmessageresult: result});
    this.setState({addmessagestring: message});
    this.setState({addmessagevisible: true});
    await delay(5000);
    this.setState({addmessagevisible: false});
  }
  
  async showRemoveMessage(result, message){
    this.setState({removemessageresult: result});
    this.setState({removemessagestring: message});
    this.setState({removemessagevisible: true});
    await delay(5000);
    this.setState({removemessagevisible: false});
  }
  
  
  //Remove a detector model
  async removeEventModel() {
    try{
      const path = "/iotevents/delete"; // you can specify the path
     const params = {
        "modelname": this.state.deletemodelname
     }
     console.log(params);
     const myInit = {
      "body": params
      };
    const apiResponse = await API.put("api75996003" , path, myInit);
    if(apiResponse.result == true){
        this.showRemoveMessage(apiResponse.result, "The Event Detector Model was deleted successfully")
      }
      else{
        this.showRemoveMessage(apiResponse.result, apiResponse.errormessage)
      }
    }catch(err){
        this.showRemoveMessage(false, err.message);  
    }
  }
  
  // Creates a list of labels/icons to show the current state of each instance
  // for a selected detector model
  Items() {
    return this.state.detectorinstances.sort(makeComparator('key')).map(detector =>
      <List.Item key={detector.key}>
        <div>
        <Segment>
          <Label as='a' color='green' image>
            <Icon name='eye'/>
            {detector.key}
            <Label.Detail>{detector.text}</Label.Detail>
          </Label>
        </Segment>
        </div>
      </List.Item>
    );
  }
  
  componentDidMount() {
       this.loadEvents();
  }


  // Rendering of UI elements
  render() {
    const {isFetching, isFetchingDetectors,  removemessageresult, removemessagestring, removemessagevisible, addmessageresult, addmessagestring, addmessagevisible, options, deletemodelname, value, viewmodelname, modelUniqueId, template, topic, modelname, timeout, detectorinstances } = this.state
    
    const templateOptions = [
      {
        key: 'Simple Alarm',
        text: 'Simple Alarm',
        value: 'Simple Alarm'
      },
      {
        key: 'HVAC Temperature Control',
        text: 'HVAC Temperature Control',
        value: 'HVAC Temperature Control',
      }
    ]
    return (
      <AmplifyAuthenticator>
        <div className="App">
        <Grid padded centered>
          <Grid.Column width='10'>
          <Header as='h1' icon textAlign='center'>
            <Image src='./iotevents.png'  />
            <Header.Content>IoT Events - Demo</Header.Content>
          </Header>
              <Segment>
                <Header as='h3' textAlign='left'>
                  <Icon name='plus circle' />
                  <Header.Content>
                    Create Event Model
                    <Header.Subheader>Create a new IoT Event model</Header.Subheader>
                  </Header.Content>
                </Header>
                <Segment basic>
                  <Segment.Group>
                    <Segment.Group>
                    <Dropdown 
                      placeholder='Select Event Model template' 
                      fluid
                      options={templateOptions}
                      onChange={this.handleTemplateChange}
                      />
                    </Segment.Group>
                    <Segment><Input fluid onChange={this.handleModelNameChange} placeholder="Event Model Name..." /></Segment>
                    <Segment><Input fluid onChange={this.handleTimeoutChange} placeholder="Alarm Timeout(s)..." /></Segment>
                    <Segment><Input fluid onChange={this.handleTopicChange} placeholder="Input Topic..." /></Segment>
                    <Segment><Button primary onClick={this.handleClickAdd}>Add Model</Button></Segment>
                  </Segment.Group>
                </Segment>
                <Message
                  success={addmessageresult}
                  header={addmessagestring}
                  hidden={!addmessagevisible}
                  negative={!addmessageresult}
                />
              </Segment>
              <Segment>
                <Header as='h3' textAlign='left'>
                  <Icon name='dashboard' />
                  <Header.Content>
                    Monitor Event Model
                    <Header.Subheader>Select an IoT Event to monitor it's state</Header.Subheader>
                  </Header.Content>
                </Header>
                <Segment basic>
                  <Segment.Group>
                    <Segment.Group horizontal>
                    <Dropdown fluid placeholder='Select an Event Model' 
                        disabled={isFetching}
                        loading={isFetching}
                        options={options}
                        defaultValue={viewmodelname}
                        onChange={this.handleEventModelChange}
                        />
                      <Button circular icon='refresh' onClick={this.handleClickRefresh} color='black'>
                      </Button>
                    </Segment.Group>
                    {this.Items()}
                  </Segment.Group>
                </Segment>
              </Segment>
              <Segment>
                <Header as='h3' textAlign='left'>
                  <Icon name='remove circle' />
                  <Header.Content>
                    Remove Event Models
                    <Header.Subheader>Remove existing IoT Event models</Header.Subheader>
                  </Header.Content>
                </Header>
                <Segment basic>
                  <Segment.Group horizontal>
                  <Dropdown fluid placeholder='Existing Event Models' 
                        disabled={isFetching}
                        loading={isFetching}
                        options={options}
                        defaultValue={deletemodelname}
                        onChange={this.handleEventModelRemoveChange}
                        />
                    <Button secondary onClick={this.handleClickRemove}>Remove</Button>
                  </Segment.Group>
                  <Message
                    success={removemessageresult}
                    header={removemessagestring}
                    hidden={!removemessagevisible}
                    negative={!removemessageresult}
                  />
                </Segment>
              </Segment>
            <AmplifySignOut />
          </Grid.Column>
        </Grid>
      </div>
    </AmplifyAuthenticator>
    )
  }
}

function makeComparator(key, order='asc') {
  return (a, b) => {
    if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) return 0; 

    const aVal = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
    const bVal = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    if (aVal < bVal) comparison = -1;

    return order === 'desc' ? (comparison * -1) : comparison
  };
}

const styles = {
  container: { width: 500, margin: '0 auto', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default App