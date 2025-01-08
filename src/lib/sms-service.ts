import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { config } from 'dotenv';
config();

@Injectable()
export class SMSSerive {
  async send(destination: string, message: string) {
    try {
      // console.log({
      //   username: process.env.SMS_USERNAME,
      //   password: process.env.SMS_PASSWORD,
      //   id: process.env.SMS_SENDER_ID,
      // });
      const ret = await axios.post(
        'https://sms.nalosolutions.com/smsbackend/Resl_Nalo/send-message/',
        {
          username: process.env.SMS_USERNAME,
          password: process.env.SMS_PASSWORD,
          msisdn: destination,
          message: message,
          sender_id: process.env.SMS_SENDER_ID,
        },
      );
      // const ret = await axios.get(
      //   `https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/?username=${process.env.SMS_USERNAME}&password=${process.env.SMS_PASSWORD}&type=0&destination=${destination}&dlr=1&source=NALO&message=${message}`,
      // );

      // console.log(ret.data);

      return ret.data;
    } catch (error) {
      console.log(error);
    }
  }
}
