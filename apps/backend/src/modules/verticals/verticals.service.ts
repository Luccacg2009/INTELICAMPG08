import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerticalConfig } from './vertical-config.entity';
import { CompanyValue } from './vertical-config.entity';
import { UserVertical } from '../../common/enums/user.enums';

@Injectable()
export class VerticalsService {
  constructor(
    @InjectRepository(VerticalConfig)
    private verticalRepository: Repository<VerticalConfig>,
    @InjectRepository(CompanyValue)
    private valueRepository: Repository<CompanyValue>,
  ) {}

  async initializeDefaults(): Promise<void> {
    const verticals = Object.values(UserVertical).filter(v => v !== UserVertical.OTHER);
    for (const vertical of verticals) {
      const exists = await this.verticalRepository.findOne({ where: { vertical } });
      if (!exists) {
        await this.verticalRepository.save(this.verticalRepository.create({
          vertical,
          name: vertical.charAt(0) + vertical.slice(1).toLowerCase(),
          values: [],
          isActive: true,
        }));
      }
    }

    const defaultValues = [
      { name: 'Inovação', description: 'Busca constante por novas soluções e melhorias' },
      { name: 'Sustentabilidade', description: 'Compromisso com impacto ambiental positivo' },
      { name: 'Ética', description: 'Conduta íntegra e transparente em todas as ações' },
      { name: 'Foco no Cliente', description: 'Decisões baseadas nas necessidades do cliente' },
      { name: 'Excelência', description: 'Busca pela qualidade superior em tudo que fazemos' },
    ];

    for (const val of defaultValues) {
      const exists = await this.valueRepository.findOne({ where: { name: val.name } });
      if (!exists) {
        await this.valueRepository.save(this.valueRepository.create(val));
      }
    }
  }

  async getVerticals(): Promise<VerticalConfig[]> {
    return this.verticalRepository.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async getVertical(vertical: UserVertical): Promise<VerticalConfig> {
    const config = await this.verticalRepository.findOne({ where: { vertical, isActive: true } });
    if (!config) throw new NotFoundException('Vertical não encontrada');
    return config;
  }

  async updateVertical(vertical: UserVertical, data: Partial<VerticalConfig>): Promise<VerticalConfig> {
    const config = await this.getVertical(vertical);
    Object.assign(config, data);
    return this.verticalRepository.save(config);
  }

  async getCompanyValues(): Promise<CompanyValue[]> {
    return this.valueRepository.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async createValue(data: { name: string; description: string }): Promise<CompanyValue> {
    const value = this.valueRepository.create(data);
    return this.valueRepository.save(value);
  }

  async updateValue(id: string, data: Partial<CompanyValue>): Promise<CompanyValue> {
    const value = await this.valueRepository.findOne({ where: { id } });
    if (!value) throw new NotFoundException('Valor não encontrado');
    Object.assign(value, data);
    return this.valueRepository.save(value);
  }

  async deleteValue(id: string): Promise<void> {
    await this.valueRepository.delete(id);
  }
}