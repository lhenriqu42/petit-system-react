import { Box, Divider, Grid2, TableCell, TableRow, Typography } from "@mui/material";
import { CustomPaper } from "./CustomPaper";
import { ListArray } from "../../../shared/components/ListArray";
import { format } from "date-fns";
import { useState } from "react";
import { formatDateWithCustomDay } from "./Date";
interface ICustomProps {
	dateRange: { startDate: Date; endDate: Date; };
}
export const ReportData: React.FC<ICustomProps> = ({ dateRange }) => {
	const [dateRangeFormatted] = useState<string>(`${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`);

	const PaperBorderColors = ['#23a6d5', '#429321'];
	return (
		<Box mt={1} mb={4}>
			<Grid2 container spacing={2}>
				<Grid2 size={4}>
					<CustomPaper borderColor={PaperBorderColors[0]} border mt={2} height={242}>
						<Typography variant="h6" p={2}>Lucro Total</Typography>
						<Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} p={2} gap={2}>
							<Typography variant="h4" color='green'>R$ 15.000,00</Typography>
							<Typography variant="subtitle1">Período: {dateRangeFormatted}</Typography>
						</Box>
					</CustomPaper>
					<CustomPaper borderColor={PaperBorderColors[0]} border mt={2} height={242}>
						<Typography variant="h6" p={2}>Faturamento Total</Typography>
						<Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'} p={2} gap={2}>
							<Typography variant="h4" color='blue'>R$ 50.000,00</Typography>
							<Typography variant="subtitle1">Período: {dateRangeFormatted}</Typography>
						</Box>
					</CustomPaper>
				</Grid2>
				<Grid2 size={8}>
					<CustomPaper borderColor={PaperBorderColors[0]} border mt={2} height={500}>
						<Typography variant="h6" p={2}>Top 50 Produtos</Typography>
						<ListArray
							items={[{
								id: 1,
								productName: 'Produto A',
								quantitySold: 150,
								revenue: 3000,
								profit: 1200,
								profitMargin: '40%',
								profitParticipation: '25%',
							}]}
							CustomTableRowHeader={() =>
								<TableRow>
									<TableCell>Produto</TableCell>
									<TableCell>Quantidade Vendida</TableCell>
									<TableCell>Faturamento</TableCell>
									<TableCell>Lucro</TableCell>
									<TableCell>Margem de Lucro</TableCell>
									<TableCell>Participação do Lucro (%)</TableCell>
								</TableRow>
							}
							CustomTableRow={
								({ row }) =>
									<TableRow key={row.id}>
										<TableCell>{row.productName}</TableCell>
										<TableCell>{row.quantitySold}</TableCell>
										<TableCell>R$ {row.revenue.toFixed(2)}</TableCell>
										<TableCell>R$ {row.profit.toFixed(2)}</TableCell>
										<TableCell>{row.profitMargin}</TableCell>
										<TableCell>{row.profitParticipation}</TableCell>
									</TableRow>
							}
						/>
					</CustomPaper>
				</Grid2>
			</Grid2>
			<Divider sx={{ mt: 3, borderTop: 2, mx: 5, mb: 1 }} />
			<Grid2 container spacing={2}>
				<Grid2 size={4}>
					<CustomPaper borderColor={PaperBorderColors[1]} border mt={2} height={242}>
						<Typography variant="h6" p={2}>Faturamento Diario</Typography>
						<ListArray
							items={[{
								id: 1,
								date: '01/10/2023',
								revenue: 5000,
								profit: 1500,
								resultPercentage: '30%',
							}]}
							CustomTableRowHeader={() =>
								<TableRow>
									<TableCell>Data</TableCell>
									<TableCell>Faturamento</TableCell>
									<TableCell>Lucro</TableCell>
									<TableCell>Resultado %</TableCell>
								</TableRow>
							}
							CustomTableRow={
								({ row }) =>
									<TableRow key={row.id}>
										<TableCell>{formatDateWithCustomDay(new Date(row.date), 'dd/MM/yyyy')}</TableCell>
										<TableCell>R$ {row.revenue.toFixed(2)}</TableCell>
										<TableCell>R$ {row.profit.toFixed(2)}</TableCell>
										<TableCell>{row.resultPercentage}</TableCell>
									</TableRow>
							}
						/>
					</CustomPaper>
				</Grid2>
				<Grid2 size={8}>
					<CustomPaper borderColor={PaperBorderColors[1]} border mt={2} height={500}>
						<Typography variant="h6" p={2}>Projeção</Typography>
					</CustomPaper>
				</Grid2>
			</Grid2>
		</Box>
	)
}