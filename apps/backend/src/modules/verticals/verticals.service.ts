import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerticalConfig, CompanyValue, VerticalBenchmark, MarketBenchmark } from './vertical-config.entity';
import { UserVertical } from '../../common/enums/user.enums';

@Injectable()
export class VerticalsService {
  constructor(
    @InjectRepository(VerticalConfig)
    private verticalRepository: Repository<VerticalConfig>,
    @InjectRepository(CompanyValue)
    private valueRepository: Repository<CompanyValue>,
    @InjectRepository(VerticalBenchmark)
    private benchmarkRepository: Repository<VerticalBenchmark>,
    @InjectRepository(MarketBenchmark)
    private marketBenchmarkRepository: Repository<MarketBenchmark>,
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

  async getBenchmark(vertical: UserVertical): Promise<VerticalBenchmark | null> {
    return this.benchmarkRepository.findOne({ 
      where: { vertical, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async createBenchmark(data: Partial<VerticalBenchmark>): Promise<VerticalBenchmark> {
    const benchmark = this.benchmarkRepository.create(data);
    return this.benchmarkRepository.save(benchmark);
  }

  async updateBenchmark(id: string, data: Partial<VerticalBenchmark>): Promise<VerticalBenchmark> {
    const benchmark = await this.benchmarkRepository.findOne({ where: { id } });
    if (!benchmark) throw new NotFoundException('Benchmark não encontrado');
    Object.assign(benchmark, data);
    
    if (benchmark.totalProposals > 0) {
      benchmark.successRate = (benchmark.successfulProposals / benchmark.totalProposals) * 100;
    }
    
    return this.benchmarkRepository.save(benchmark);
  }

  async getMarketBenchmarks(vertical: UserVertical): Promise<MarketBenchmark[]> {
    return this.marketBenchmarkRepository.find({ 
      where: { vertical, isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async createMarketBenchmark(data: Partial<MarketBenchmark>): Promise<MarketBenchmark> {
    const benchmark = this.marketBenchmarkRepository.create(data);
    return this.marketBenchmarkRepository.save(benchmark);
  }

  async updateMarketBenchmark(id: string, data: Partial<MarketBenchmark>): Promise<MarketBenchmark> {
    const benchmark = await this.marketBenchmarkRepository.findOne({ where: { id } });
    if (!benchmark) throw new NotFoundException('Benchmark de mercado não encontrado');
    Object.assign(benchmark, data);
    return this.marketBenchmarkRepository.save(benchmark);
  }

  async deleteMarketBenchmark(id: string): Promise<void> {
    await this.marketBenchmarkRepository.delete(id);
  }

  async getBenchmarkContext(vertical: UserVertical): Promise<string> {
    const benchmark = await this.getBenchmark(vertical);
    const marketBenchmarks = await this.getMarketBenchmarks(vertical);
    
    if (!benchmark && marketBenchmarks.length === 0) {
      return 'Nenhum dado histórico disponível para esta vertical.';
    }

    let context = '\n\nDADOS HISTÓRICOS E BENCHMARKS DA VERTICAL:\n';
    
    if (benchmark) {
      context += `
--- PERFORMANCE HISTÓRICA ---
Total de propostas analisadas: ${benchmark.totalProposals}
Propostas bem-sucedidas: ${benchmark.successfulProposals}
Taxa de sucesso: ${benchmark.successRate.toFixed(1)}%
Custo médio: ${benchmark.avgCost ? `R$ ${benchmark.avgCost.toLocaleString('pt-BR')}` : 'Não informado'}
Tempo médio para mercado: ${benchmark.avgTimeToMarketDays ? `${benchmark.avgTimeToMarketDays} dias` : 'Não informado'}
Resumo feedback clientes: ${benchmark.customerFeedbackSummary || 'Não disponível'}
Análise competitiva: ${benchmark.competitorAnalysis || 'Não disponível'}
Fatores-chave de sucesso: ${benchmark.keySuccessFactors?.join(', ') || 'Não definidos'}
Principais motivos de falha: ${benchmark.commonFailureReasons?.join(', ') || 'Não definidos'}
`;
    }

    if (marketBenchmarks.length > 0) {
      context += '\n--- CONCORRENTES DE MERCADO ---\n';
      marketBenchmarks.forEach((comp, i) => {
        context += `
${i + 1}. ${comp.competitorName}
   Produto: ${comp.productDescription}
   Market Share: ${comp.marketShare ? `${comp.marketShare}%` : 'N/I'}
   Preço: ${comp.pricePoint ? `R$ ${comp.pricePoint.toLocaleString('pt-BR')}` : 'N/I'}
   Pontos fortes: ${comp.strengths || 'N/I'}
   Pontos fracos: ${comp.weaknesses || 'N/I'}
   Diferenciais: ${comp.keyDifferentiators || 'N/I'}
`;
      });
    }

    return context;
  }
}