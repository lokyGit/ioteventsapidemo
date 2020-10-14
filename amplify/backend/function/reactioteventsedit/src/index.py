import boto3
import json

client = boto3.client('iotevents')
clientdata = boto3.client('iotevents-data')
iotclient = boto3.client('iot')

def handler(event, context):
  print(event)

  if(event["path"] == "/iotevents/list"):
    #List configure detector models
    response = client.list_detector_models(
        maxResults=10
    )
    
    models = {
      "options": []
    }
    
    # Create response format
    for model in response["detectorModelSummaries"]:
      modelitem = {
        "key": model["detectorModelName"],
        "text": model["detectorModelName"],
        "value": model["detectorModelName"]
      }
      models["options"].append(modelitem)
    return {
        "body": json.dumps(models),
        "headers": {
            "Access-Control-Allow-Credentials" : True,
            "Access-Control-Allow-Origin": "*",
        },
        "statusCode": 200,
    };
    
  elif(event["path"] == "/iotevents/detectors"):
    param = json.loads(event["body"])
    
    #List configure detector models
    response = clientdata.list_detectors(
        detectorModelName=param["viewmodelname"]
    )  
    
    models = {
      "options": []
    }
    
    # Create response format
    for model in response["detectorSummaries"]:
      modelitem = {
        "key": model["keyValue"],
        "text": model["state"]["stateName"],
        "value": model["keyValue"]
      }
      models["options"].append(modelitem)
    return {
        "body": json.dumps(models),
        "headers": {
            "Access-Control-Allow-Credentials" : True,
            "Access-Control-Allow-Origin": "*",
        },
        "statusCode": 200,
    };  
    
  elif(event["path"] == "/iotevents/add"):
    try:
        ## Create Input
        param = json.loads(event["body"])
        
        try:
            response = client.create_input(
                inputName=param["modelname"],
                inputDescription='',
                inputDefinition={
                    "attributes": [
                      { "jsonPath": "alarmId" },
                      { "jsonPath": "command" },
                      { "jsonPath": "value" },
                      { "jsonPath": "threshold" }
                    ]
                }
            )
        except Exception as e:
            print("Exception creating input: " + str(e))

        print("Creating detector model...")
        jsonString = json.dumps(sampleAlarmjson).replace("AWS_IoTEvents_Blueprints_Simple_Alarm_Input", param["modelname"])
        jsonString = jsonString.replace("120", param["timeout"])
        response = client.create_detector_model(
            detectorModelName=param["modelname"],
            detectorModelDefinition= json.loads(jsonString)["detectorModelDefinition"],
            detectorModelDescription= "This detector model is used to detect if a monitored device is in an Alarming State.", 
            roleArn= "arn:aws:iam::735953786820:role/service-role/iot_detector_role", 
            key= "alarmId",
            evaluationMethod='SERIAL')
        
        print(response)
        return {
            "body": json.dumps({"result": True}),
            "headers": {
                "Access-Control-Allow-Credentials" : True,
                "Access-Control-Allow-Origin": "*",
            },
            "statusCode": 200,
        };
    except Exception as e:
        print("Exception: " + str(e))
        return {
            "body": json.dumps({"result": False,
                "errormessage": str(e)
            }),
            "headers": {
                "Access-Control-Allow-Credentials" : True,
                "Access-Control-Allow-Origin": "*",
            },
            "statusCode": 200,
        };

  elif(event["path"] == "/iotevents/delete"):
    try:
        ## Remove model
        param = json.loads(event["body"])
        
        try:
            response = client.delete_detector_model(
                detectorModelName=param["modelname"]
            )
        except Exception as e:
            print("Exception delete model: " + str(e))

        return {
            "body": json.dumps({True}),
            "headers": {
                "Access-Control-Allow-Credentials" : True,
                "Access-Control-Allow-Origin": "*",
            },
            "statusCode": 200,
        };
    except Exception as e:
        print("Exception: " + str(e))
        return {
            "body": json.dumps({
                "errormessage": str(e)
            }),
            "headers": {
                "Access-Control-Allow-Credentials" : True,
                "Access-Control-Allow-Origin": "*",
            },
            "statusCode": 200,
        };

    
sampleAlarmjson = {
    "detectorModelDefinition": {
        "states": [
            {
                "onInput": {
                    "transitionEvents": [
                        {
                            "eventName": "not_fixed", 
                            "actions": [], 
                            "condition": "timeout(\"snoozeTime\")", 
                            "nextState": "Alarming"
                        }, 
                        {
                            "eventName": "reset", 
                            "actions": [], 
                            "condition": "$input.AWS_IoTEvents_Blueprints_Simple_Alarm_Input.command == \"reset\"", 
                            "nextState": "Normal"
                        }
                    ], 
                    "events": [
                        {
                            "eventName": "DND", 
                            "actions": [
                                {
                                    "setVariable": {
                                        "variableName": "dnd_active", 
                                        "value": "1"
                                    }
                                }
                            ], 
                            "condition": "$input.AWS_IoTEvents_Blueprints_Simple_Alarm_Input.command == \"dnd\""
                        }
                    ]
                }, 
                "stateName": "Snooze", 
                "onEnter": {
                    "events": [
                        {
                            "eventName": "Create Timer", 
                            "actions": [
                                {
                                    "setTimer": {
                                        "seconds": 120, 
                                        "timerName": "snoozeTime"
                                    }
                                }
                            ], 
                            "condition": "true"
                        }
                    ]
                }, 
                "onExit": {
                    "events": []
                }
            }, 
            {
                "onInput": {
                    "transitionEvents": [
                        {
                            "eventName": "out_of_range", 
                            "actions": [], 
                            "condition": "$input.AWS_IoTEvents_Blueprints_Simple_Alarm_Input.value > $variable.threshold", 
                            "nextState": "Alarming"
                        }
                    ], 
                    "events": [
                        {
                            "eventName": "Create Config variables", 
                            "actions": [
                                {
                                    "setVariable": {
                                        "variableName": "threshold", 
                                        "value": "$input.AWS_IoTEvents_Blueprints_Simple_Alarm_Input.threshold"
                                    }
                                }
                            ], 
                            "condition": "$variable.threshold != $variable.threshold"
                        }
                    ]
                }, 
                "stateName": "Normal", 
                "onEnter": {
                    "events": [
                        {
                            "eventName": "Init", 
                            "actions": [
                                {
                                    "setVariable": {
                                        "variableName": "dnd_active", 
                                        "value": "0"
                                    }
                                }
                            ], 
                            "condition": "true"
                        }
                    ]
                }, 
                "onExit": {
                    "events": []
                }
            }, 
            {
                "onInput": {
                    "transitionEvents": [
                        {
                            "eventName": "reset", 
                            "actions": [], 
                            "condition": "$input.AWS_IoTEvents_Blueprints_Simple_Alarm_Input.command == \"reset\"", 
                            "nextState": "Normal"
                        }, 
                        {
                            "eventName": "acknowledge", 
                            "actions": [], 
                            "condition": "$input.AWS_IoTEvents_Blueprints_Simple_Alarm_Input.command == \"acknowledge\"", 
                            "nextState": "Snooze"
                        }
                    ], 
                    "events": [
                        {
                            "eventName": "Escalated Alarm Notification", 
                            "actions": [
                                {
                                    "sns": {
                                        "targetArn": "arn:aws:sns:us-west-2:735953786820:SimpleAlarmAlerts"
                                    }
                                }
                            ], 
                            "condition": "timeout(\"unacknowledgeTIme\")"
                        }
                    ]
                }, 
                "stateName": "Alarming", 
                "onEnter": {
                    "events": [
                        {
                            "eventName": "Alarm Notification", 
                            "actions": [
                                {
                                    "sns": {
                                        "targetArn": "arn:aws:sns:us-west-2:735953786820:SimpleAlarmAlerts"
                                    }
                                }, 
                                {
                                    "setTimer": {
                                        "seconds": 300, 
                                        "timerName": "unacknowledgeTIme"
                                    }
                                }
                            ], 
                            "condition": "$variable.dnd_active != 1"
                        }
                    ]
                }, 
                "onExit": {
                    "events": []
                }
            }
        ], 
        "initialStateName": "Normal"
    } 
}
