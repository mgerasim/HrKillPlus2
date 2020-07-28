import { Lead } from "../models/lead";
import axios, { AxiosResponse } from 'axios';
import { Staff } from "../models/staff";
import 'url-search-params-polyfill';
import { Employee } from "../models/employee";

const accessToken = "694eapj3u7x7j59rgmqepp890l6nj9snctnq336a";


export class UiscomIntegrator {
    /**
     * getEmployee
     */
    public getEmployee(phoneNumber: string): Promise<Employee | undefined> {
        return new Promise((resolve, reject) => {
            axios.post<any>(`https://dataapi.uiscom.ru/v2.0`,
            {
                id: "1",
                method: "get.employees",
                jsonrpc: "2.0",
                params: {
                    access_token: accessToken,
                    filter: {
                        field: 'phone_numbers',
                        operator: 'jsquery',
                        value: `#.phone_number = \"${phoneNumber}\"`
                    }
                }
            },            {
                headers: {

                }
            }).then((result) => {
                console.log(result.data);
                resolve(result.data.result.data[0]);
            }).catch((err) => {
                console.error(err.message);
                resolve(undefined);
            });
        });
    }

    public makeCall(phone: string, employeeId: number, ext: string, callerId: string): Promise<any> {
        const params = {
            access_token: accessToken,
            first_call: 'employee',
            switch_at_once: false,
            early_switching: false,
            virtual_phone_number: callerId,
            show_virtual_phone_number: true,
            contact: phone,
            direction: 'out',
            employee: {
                id: employeeId,
                phone_number: ext
            }
        };

        return new Promise((resolve, reject) => {

            axios.post<any>(`https://callapi.comagic.ru/v4.0`,
            {

                id: 'reqMakeCall2',
                method: 'start.employee_call',
                jsonrpc: '2.0',
                params
            },
            {
                headers: {
                }
            }).then((result) => {
// console.log(result.data.result);

                resolve(result.data);
            }).catch(err => {
                console.error(err.message);

                resolve(err.message);
            });
        });

    }
}