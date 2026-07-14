import { Repository } from 'typeorm';
import { VerticalConfig } from './vertical-config.entity';
import { CompanyValue } from './vertical-config.entity';
import { UserVertical } from '../../common/enums/user.enums';
export declare class VerticalsService {
    private verticalRepository;
    private valueRepository;
    constructor(verticalRepository: Repository<VerticalConfig>, valueRepository: Repository<CompanyValue>);
    initializeDefaults(): Promise<void>;
    getVerticals(): Promise<VerticalConfig[]>;
    getVertical(vertical: UserVertical): Promise<VerticalConfig>;
    updateVertical(vertical: UserVertical, data: Partial<VerticalConfig>): Promise<VerticalConfig>;
    getCompanyValues(): Promise<CompanyValue[]>;
    createValue(data: {
        name: string;
        description: string;
    }): Promise<CompanyValue>;
    updateValue(id: string, data: Partial<CompanyValue>): Promise<CompanyValue>;
    deleteValue(id: string): Promise<void>;
}
//# sourceMappingURL=verticals.service.d.ts.map