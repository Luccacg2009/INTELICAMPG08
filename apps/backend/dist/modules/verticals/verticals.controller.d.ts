import { VerticalsService } from './verticals.service';
import { VerticalConfig, CompanyValue } from './vertical-config.entity';
import { UserVertical } from '../../common/enums/user.enums';
export declare class VerticalsController {
    private verticalsService;
    constructor(verticalsService: VerticalsService);
    getVerticals(): Promise<VerticalConfig[]>;
    getVertical(vertical: UserVertical): Promise<VerticalConfig>;
    updateVertical(vertical: UserVertical, data: Partial<VerticalConfig>): Promise<VerticalConfig>;
    getValues(): Promise<CompanyValue[]>;
    createValue(data: {
        name: string;
        description: string;
    }): Promise<CompanyValue>;
    updateValue(id: string, data: Partial<CompanyValue>): Promise<CompanyValue>;
    deleteValue(id: string): Promise<void>;
}
//# sourceMappingURL=verticals.controller.d.ts.map