const imageObject = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '288195591053494',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '919453225060',
                phone_number_id: '366490143206901'
              },
              contacts: [
                {
                  profile: { name: 'R. Animesh' },
                  wa_id: '919452624111'
                }
              ],
              messages: [
                {
                  from: '919452624111',
                  id: 'wamid.HBgMOTE5NDUyNjI0MTExFQIAEhggMDEzM0FDNDQyMkVBQTc1MDUxOUJGQjExNjQ5MDU0NTcA',
                  timestamp: '1726345225',
                  type: 'image',
                  image: {
                    mime_type: 'image/jpeg',
                    sha256: '8t2njCQieP6xP69PnF8Cg9vPpHptiwH82oAekD8nfJA=',
                    id: '926889639273768'
                  }
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  }

//   console.log(imageObject.entry[0].changes[0].value.messages) // R. Animesh