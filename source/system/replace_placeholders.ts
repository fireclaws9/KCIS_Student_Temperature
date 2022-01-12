export interface PlaceHolder {
    placeholder_id: string,
    placeholder_value: string
};

export function replace_placeholders(raw_string: string, placeholders: PlaceHolder[]): string {
    return raw_string.replace(/{\w+}/g, placeholder_matcher => {
        const placeholder_matcher_id = placeholder_matcher.toLowerCase().slice(1, placeholder_matcher.length - 1);
        const matched_placeholders = placeholders.filter(loop_placeholder => loop_placeholder.placeholder_id === placeholder_matcher_id);
        return (matched_placeholders.length > 0 ? matched_placeholders[0].placeholder_value : placeholder_matcher);
    });
}