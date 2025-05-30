interface Procedure {
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface Role {
    _id: string;
    role: {
        _id: string;
        name: string;
        procedures: Array<{
            _id: string;
            procedure: Procedure;
        }>;
    };
}

interface UserData {
    success: boolean;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phone: string;
        role: string;
        _roles: Role[];
        user: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
    };
}