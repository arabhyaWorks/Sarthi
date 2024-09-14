import sendMessage from "../sendMessage";
import storeData from "../functions/storeOnboarding";
import sendInteractiveList from "../functions/interactiveList";
import { textToTextTranslationNMT } from "../bhashini";

const handle_enter_shop_name = async () => {
  const enterStateText = await textToTextTranslationNMT(
    "Please select the category of your shop.From the following options",
    selectedLanguageCode
  );
  await sendMessage(business_phone_number_id, message.from, enterStateText);

  const body = await textToTextTranslationNMT(
    "Which of these best describes your products?\n\nPlease select the category of your shop.",
    selectedLanguageCode
  );

  const buttonTitle = await textToTextTranslationNMT(
    "Select Category",
    selectedLanguageCode
  );
  const list = storeData.storeDetail.category;

  await sendInteractiveList("", body, "", buttonTitle, list, message.from);
};

export default handle_enter_shop_name;
