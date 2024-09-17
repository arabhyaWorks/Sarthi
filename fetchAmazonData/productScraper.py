import requests
# import json

# Structure payload
payload = {
    'source': 'amazon_product',
    # 'query': 'B0CX23V2ZK',
    'url':"https://www.amazon.in/Gold-Art-India-Dashboard-Antique/dp/B0D25LKWWW/?_encoding=UTF8&pd_rd_w=f0dI3&content-id=amzn1.sym.5cc895fe-fa07-4bc6-b39f-6a10345a66fd%3Aamzn1.symc.adb93342-6ac2-461a-9cdb-1d06116dc6f6&pf_rd_p=5cc895fe-fa07-4bc6-b39f-6a10345a66fd&pf_rd_r=NDB1YQN31P8J72367ZJB&pd_rd_wg=kGSPN&pd_rd_r=bc3b7959-c86a-4a1a-aa8c-d51389155c0d&ref_=pd_hp_d_atf_ci_mcx_mr_ca_hp_atf_d&th=1",
    'domain': 'in',
    'geo_location': '221010',
    'parse': True
}

# Get response by using real-time endpoint
response = requests.request(
    'POST',
    'https://realtime.oxylabs.io/v1/queries',
    auth=('arabhaya_SfWiG', 'Arabhaya7+9=16'),  # Your credentials go here
    json=payload,
)

productData = {
    "title": response.json()["results"][0]["content"]["title"],
    "price": response.json()["results"][0]["content"]["price"],
    "about": response.json()["results"][0]["content"]["bullet_points"],
    "description": response.json()["results"][0]["content"]["description"],
    "images": response.json()["results"][0]["content"]["images"],
}

print(productData)

# with open('output.json', 'w') as json_file:
#     json.dump(productData, json_file, indent=4)
#     print("Response saved to output.json")
