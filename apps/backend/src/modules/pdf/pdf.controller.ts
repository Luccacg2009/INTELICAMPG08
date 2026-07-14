import { Controller, Get, Param, Res, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { IdeasService } from '../ideas/ideas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('pdf')
@ApiBearerAuth()
@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(
    private pdfService: PdfService,
    private ideasService: IdeasService,
  ) {}

  @Get('idea/:id')
  @ApiOperation({ summary: 'Gerar e baixar PDF da ideia' })
  @ApiResponse({ status: 200, description: 'PDF gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Ideia não encontrada' })
  async generateIdeaPdf(@Param('id') id: string, @Res() res: Response, @CurrentUser() user: User) {
    const idea = await this.ideasService.findById(id);

    if (!idea.aiSummary || !idea.aiStrengths || !idea.aiWeaknesses || !idea.aiDevelopment) {
      return res.status(400).json({ message: 'Resumo por IA não disponível para esta ideia' });
    }

    const pdfBuffer = await this.pdfService.generateIdeaPdf({
      idea,
      author: idea.author,
      summary: idea.aiSummary,
      strengths: idea.aiStrengths,
      weaknesses: idea.aiWeaknesses,
      developmentWays: idea.aiDevelopment,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ideia-${idea.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}