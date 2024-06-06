interface IScanned {
    wholeText: string;
    cccd: string;
    cmnd: string;
    fullname: string;
    gender: string;
    dob: Date;
    fullAddress: string;
    issuedAt: Date;
}

const parseDateString = (dateString: string): Date => {
    if (dateString.length < 8) {
        throw new Error("Invalid date format. Expected 'ddMMyyyy'.");
    }

    // Extract day, month, and year from the string
    const day = parseInt(dateString.slice(0, 2), 10);
    const month = parseInt(dateString.slice(2, 4), 10) - 1;
    const year = parseInt(dateString.slice(4, 8), 10);

    return new Date(year, month, day);
}

const extractScannedData = (data: string):IScanned => {
    const child = data.split("|");

    const returnData: IScanned = {
        wholeText: data,
        cccd: child[0] ?? null,
        cmnd: child[1] ?? null,
        fullname: child[2] ?? null,
        dob: parseDateString(child[3]) ?? null,
        gender: child[4]?? null,
        fullAddress: child[5]?? null,
        issuedAt: parseDateString(child[6]) ?? null,
    }

    return returnData;
};

module.exports = { extractScannedData };
