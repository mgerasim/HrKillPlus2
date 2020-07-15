import { Lead } from "../models/lead";
import axios, { AxiosResponse } from 'axios';
import { Staff } from "../models/staff";
import 'url-search-params-polyfill';
import { Task } from "../models/task";

const authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiaTYyNjExIiwibmFtZSI6Ik1JS0hBSUwgR0VSQVNJTU9WIiwicGFzc3dvcmQiOm51bGwsIkFQSV9USU1FIjoxNTg2OTkwNzk2fQ.MxVRq9R1X5I3_av6z1SkB4U9GaD_7xg6lKaFkLb8jx0";

export class KillPlusIntegrator {

    public async getLeadBySearch(keySearch: string): Promise<Lead | undefined> {
        return new Promise((resolve, reject) => {
            axios.get<Lead[]>(`http://hr.killercrm.ru/api/leads/search/${keySearch}`, {
                headers: {
                    authtoken: authToken
                }
            }).then((result) => {
                resolve(result.data[0]);
            }).catch((err) => {
                console.error(err.message);
                resolve(undefined);
            });
        });
    }

    public async getLeadById(id: number): Promise<Lead | undefined> {
        return new Promise((resolve, reject) => {
            axios.get<Lead>(`http://hr.killercrm.ru/api/leads/${id}`, {
                headers: {
                    authtoken: authToken
                }
            }).then((result) => {
                resolve(result.data);
            }).catch((err) => {
                console.error(err.message);
                resolve(undefined);
            });
        });
    }

    public async updateLastContactLead(id: number): Promise<number> {
        return new Promise((resolve, reject) => {
            axios.get<number>(`http://hr.killercrm.ru/mgerasim_megapbx/events/lead_update_lastcontact?id=${id}`, {
                headers: {
                    authtoken: authToken
                }
            }).then((result) => {
                resolve(result.data);
            }).catch((err) => {
                console.error(err.message);
                resolve(undefined);
            });
        });
    }

    public async updateAddedFrom(id: number, staff: number): Promise<number> {
        return new Promise((resolve, reject) => {
            axios.get<number>(`http://hr.killercrm.ru/mgerasim_megapbx/events/lead_update_addedfrom?id=${id}&staff=${staff}`, {
                headers: {
                    authtoken: authToken
                }
            }).then((result) => {
                resolve(result.data);
            }).catch((err) => {
                console.error(err.message);
                resolve(undefined);
            });
        });
    }

    public async addLead(lead: Lead) {
        /*
        const params = new URLSearchParams();
        params.append('source', lead.source);
        params.append('status', lead.status);
        params.append('name', lead.name);
        params.append('phonenumber', lead.phonenumber);
*/

        const params = {
            source: lead.source,
            status: lead.status,
            name: lead.name,
            phonenumber: lead.phonenumber
        }

        const body = `assigned=${lead.assigned}&source=${lead.source}&status=${lead.status}&phonenumber=${lead.phonenumber}&name=${lead.name}&addedfrom={$lead.addedfrom}`;

        await axios.post<any>(`http://hr.killercrm.ru/api/leads`,
            body,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'authtoken': authToken
                }
            }
        );
    }


    public async addTask(task: Task) {

        const body = `duedate=${task.duedate}&startdate=${task.startdate}&name=${task.name}&addedfrom=0&description=${task.description}`;

        console.log(body);

        await axios.post<any>(`http://hr.killercrm.ru/api/tasks`,
            body,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'authtoken': authToken
                }
            }
        );
    }



    public async addTaskAssignees(task: Task, staff: Staff): Promise<number> {
        return new Promise((resolve, reject) => {
            axios.get<number>(`http://hr.killercrm.ru/mgerasim_megapbx/events/add_task_assignees?task=${task.id}&staff=${staff.staffid}`, {
                headers: {
                    authtoken: authToken
                }
            }).then((result) => {
                resolve(result.data);
            }).catch((err) => {
                console.error(err.message);
                resolve(undefined);
            });
        });
    }

    public async getStaffBySearch(keySearch: string): Promise<Staff | undefined> {
        return new Promise((resolve, reject) => {
            axios.get<Staff[]>(`http://hr.killercrm.ru/api/staffs/search/${keySearch}`, {
                headers: {
                    authtoken: authToken
                }
            }).then((response) => {
                resolve(response.data[0]);
            }).catch((err) => {
                console.error(err.message);
                resolve(undefined);
            });
        });
    }

    public async getStaffById(id: string): Promise<Staff | undefined> {
        return new Promise((resolve, reject) => {
            axios.get<Staff>(`http://hr.killercrm.ru/api/staffs/${id}`, {
                headers: {
                    authtoken: authToken
                }
            }).then((response) => {
                resolve(response.data);
            }).catch((err) => {
                console.error(err.message);
                resolve(undefined);
            });
        });
    }
}