import { StudentTemperature } from "./objects/StudentTemperature";
import * as time_unit_milliseconds from "./data/time_unit_milliseconds.json";
import * as automate_settings from "./data/automate_settings.json";

(async () => {
    while (true) {
        // convert UTC+0 date to local time
        const timezone_date = Date.now() + (automate_settings.schedule.timezone * time_unit_milliseconds.hour);
        const today_milliseconds = timezone_date % time_unit_milliseconds.day;
        // scheduled automate time (local time)
        const automate_milliseconds = (automate_settings.schedule.hours * time_unit_milliseconds.hour) + (automate_settings.schedule.minutes * time_unit_milliseconds.minute);
        // milliseconds until next scheduled time (local time)
        let automate_delay = (
            today_milliseconds <= automate_milliseconds
            ? automate_milliseconds - today_milliseconds // today's schedule not completed yet
            : automate_milliseconds - today_milliseconds + time_unit_milliseconds.day // today's schedule completed, go for next day.
        );
        // wait for next scheduled time
        console.log(`[${get_debug_time()}] waiting ${Math.ceil(automate_delay / time_unit_milliseconds.hour * 10) / 10} hours (${Math.ceil(automate_delay / time_unit_milliseconds.second)} seconds)`);
        await wait_milliseconds(automate_delay);
        // submit temperature for students
        for (let profile_index = 0; profile_index < automate_settings.profiles.length; profile_index++) {
            const student_profile = automate_settings.profiles[profile_index];
            const automate_status = await student_temperature(student_profile.student_id, student_profile.student_password, student_profile.student_temperature);
            console.log(`[${get_debug_time()}] entered temperature for ${student_profile.student_id}, success: ${automate_status.temperature}`);
        }
    }
})();

async function wait_milliseconds(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

async function student_temperature(id: string, password: string, temperature: number): Promise<{[key: string]: boolean}> {
    const student_temperature_object = new StudentTemperature(id, password, temperature);
    return await student_temperature_object.assign_temperature();
}

function get_debug_time(): string {
    const date_display_pattern = new Date(Date.now() + (automate_settings.schedule.timezone * time_unit_milliseconds.hour)).toISOString().match(/^(.+)T(.+)\..+$/);
    if (date_display_pattern === null) {
        return "error";
    }
    return date_display_pattern[1] + " " + date_display_pattern[2];
}