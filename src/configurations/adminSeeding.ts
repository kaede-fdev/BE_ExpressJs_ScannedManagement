import { User } from "../models/UserModel";

export const seedAdminUser = async () => {
    try {
        const adminEmail = 'admin@gmail.com'
        const existedAdmin = await User.findOne({email: adminEmail});
        
        if(!existedAdmin) {
            const admin = new User({
                email : adminEmail,
                password: "admin123@",
                isAdmin: true,
            })
            await admin.save();
            console.log('Admin user created successfully');
        }   else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error("Error when seeding user admin", error);
    }
}