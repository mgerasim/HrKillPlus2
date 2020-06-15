import { Lead } from "../models/lead";
import axios, { AxiosResponse } from 'axios';
import { Staff } from "../models/staff";

const token = "50501fab-6939-4243-b95f-abfff3505ae8";


export class MegapbxInterator {
    makeCall(phone: string, staff: Staff) {

        const params = {
            access_token: '694eapj3u7x7j59rgmqepp890l6nj9snctnq336a',
            first_call: 'employee',
            switch_at_once: false,
            early_switching: 'true',
            virtual_phone_number: '74950213555',
            show_virtual_phone_number: true,
            contact: phone,
            employee: {
                phone_number: staff.phonenumber
            }
        };


        axios.post<any>(`https://callapi.comagic.ru/v4.0`,
            {

                id: 'reqMakeCall',
                method: 'start.employee_call',
                jsonrpc: '2.0',
                params
            },
            {
                headers: {
                }
            }).then((result) => {
                console.log(result)
            });
    }
}