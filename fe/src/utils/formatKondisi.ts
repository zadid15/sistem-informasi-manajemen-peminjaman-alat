export const formatKondisi = (value: string | null | undefined) => {
    if (!value) return "-";

    return value
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};