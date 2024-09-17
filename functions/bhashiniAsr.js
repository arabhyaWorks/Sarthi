curl --location 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline' \
--header 'Accept:  */*' \
--header 'User-Agent:  Thunder Client (https://www.thunderclient.com)' \
--header 'Authorization: ZZiuNxfnJBUTWXXZmxQ7Wm6xk-R7vBZaFIZjf7nse8UXe3Oc4r4B_YW9KMgwZI_M' \
--header 'Content-Type: application/json' \
--data '{
    "pipelineTasks": [
        {
            "taskType": "asr",
            "config": {
                "language": {
                    "sourceLanguage": "hi"
                },
                "serviceId": "ai4bharat/conformer-hi-gpu--t4",
                "audioFormat": "ogg",
                "samplingRate": 16000
            }
        }
    ],
    "inputData": {
        "audio": [
            {
                "audioContent": {{base46 ogg}}
            }
        ]
    }
}'