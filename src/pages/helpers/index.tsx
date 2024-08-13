export const formattedAmount = (amount: any) => {
    if (amount) {
        const format = parseFloat(amount.toString())
        return format == 0 ? "" : format
    }

}