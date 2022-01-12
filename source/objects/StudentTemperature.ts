import fetch from "node-fetch";
import cheerio from "cheerio";
import { PlaceHolder } from "../system/replace_placeholders";
import { request_body, request_header } from "../system/session_requests";

export class StudentTemperature {

    private student_id: string;
    private student_password: string;
    private student_temperature: number;

    constructor(id: string, password: string, temperature: number) {
        this.student_id = id;
        this.student_password = password;
        this.student_temperature = temperature;
    }

    public async assign_temperature(): Promise<{[key: string]: boolean}> {
        // generate new session
        const request_session = await this.session_new();
        const request_placeholders = [
            {placeholder_id: "session_id", placeholder_value: request_session} as PlaceHolder,
            {placeholder_id: "student_id", placeholder_value: this.student_id} as PlaceHolder,
            {placeholder_id: "student_password", placeholder_value: this.student_password} as PlaceHolder,
            {placeholder_id: "student_temperature", placeholder_value: this.student_temperature.toString()} as PlaceHolder
        ];
        const request_status = {
            login: await this.session_login(request_placeholders),
            temperature: await this.session_temperature(request_placeholders),
            logout: await this.session_logout(request_placeholders)
        }
        return request_status;
    }

    private async session_new(): Promise<string> {
        // ASP.NET_SessionId
        return await fetch("https://passport.kcis.ntpc.edu.tw/Login.aspx").then(response => {
            return (response.headers as any).raw()["set-cookie"][0].match(/ASP\.NET_SessionId=(.{24});/)[1];
        });
    }

    private async session_login(request_placeholders: PlaceHolder[]): Promise<boolean> {
        const login_header = request_header(request_placeholders);
        const login_body = request_body("login", request_placeholders);
        const login_request = await fetch("https://passport.kcis.ntpc.edu.tw/Login.aspx", {
            method: "POST",
            body: (login_body as any),
            headers: login_header
        }).then(async response => {
            //const $ = cheerio.load(await response.text());
            //console.log("Username: " + $("#lblStudentName").text());
            return (response.headers as any).raw();
        });
        return login_request["set-cookie"] && login_request["set-cookie"][0] && !login_request["set-cookie"][0].match(/myStudentNumber=;/);
    }

    private async session_temperature(request_placeholders: PlaceHolder[]): Promise<boolean> {
        const temperature_header = request_header(request_placeholders);
        const temperature_body = request_body("temperature", request_placeholders);
        const temperature_request = await fetch("https://passport.kcis.ntpc.edu.tw/XGschool/StuTemp.aspx", {
            method: "POST",
            body: (temperature_body as any),
            headers: temperature_header
        }).then(async response => {
            return cheerio.load(await response.text())("#lblCommit").text();
        });
        return temperature_request === "新增成功";
    }

    private async session_logout(request_placeholders: PlaceHolder[]): Promise<boolean> {
        const logout_header = request_header(request_placeholders);
        const logout_body = request_body("logout", request_placeholders);
        await fetch("https://passport.kcis.ntpc.edu.tw/Main.aspx", {
            method: "POST",
            body: (logout_body as any),
            headers: logout_header
        });
        // no point in checking if logged out from session or not, so return true no matter what.
        return true;
    }

}