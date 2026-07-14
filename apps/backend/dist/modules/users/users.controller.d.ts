import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/users.dto';
import { User } from './user.entity';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<UserResponseDto>;
    findAll(): Promise<UserResponseDto[]>;
    getAnalysts(): Promise<UserResponseDto[]>;
    findByVertical(vertical: string): Promise<UserResponseDto[]>;
    getProfile(user: User): Promise<UserResponseDto>;
    findOne(id: string): Promise<UserResponseDto>;
    update(id: string, dto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: string): Promise<void>;
    private toResponse;
}
//# sourceMappingURL=users.controller.d.ts.map