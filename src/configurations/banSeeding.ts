import { Ban } from '../models/Ban';

const seedingData:string[] = [
    'Chính trị hậu cần',
    'Điều tra tổng hợp',
    'Cảnh sát hình sự',
    'Cảnh sát kinh tế',
    'Cảnh sát ma túy',
    'Quản lý hành chính',
    'Giao thông trật tự',
    'Phòng cháy chữa cháy',
    'Hỗ trợ tư pháp',
    'Kỹ thuật hình sự',
];

export const seedBanData = async () => {
    try {
        const existingRecords = await Promise.all(
            seedingData.map(async (record) => {
                return await Ban.findOne({ ban: record });
            }),
        );

        const newData = seedingData.filter((record, index) => !existingRecords[index]);

        if (newData.length > 0) {
            const dataToInsert = newData.map((record) => ({
                ban: record,
            }));
            await Ban.insertMany(dataToInsert);
            console.log('Seeding Ban Data success!');
        } else {
            console.log('Ban Data is already existed, no need to seed new!');
        }
    } catch (error) {
        console.error('Error when seeding ban data', error);
    }
};
