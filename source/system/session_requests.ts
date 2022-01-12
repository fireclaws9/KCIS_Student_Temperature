import * as request_parameters from "../data/request_parameters.json";
import { PlaceHolder, replace_placeholders } from "./replace_placeholders";

export function request_header(placeholders: PlaceHolder[]): {[key: string]: string} {
    const session_header = request_parameters.session_headers;
    const parameters: {[key: string]: string} = {};
    Object.keys(session_header).forEach(session_header_key => {
        parameters[session_header_key] = replace_placeholders(session_header[session_header_key as keyof typeof session_header], placeholders);
    });
    return parameters;
}

export function request_body(session_type: string, placeholders: PlaceHolder[]): URLSearchParams {
    const session_body = request_parameters.session_body[session_type as keyof typeof request_parameters.session_body];
    const parameters = new URLSearchParams();
    Object.keys(session_body).forEach(session_body_key => {
        const session_body_value = session_body[session_body_key as keyof typeof session_body];
        parameters.append(session_body_key, replace_placeholders(session_body_value, placeholders));
    });
    return parameters;
}