import { Box, Paper } from "@mui/material";


interface ICustomProps {
	children?: React.ReactNode;
	borderColor?: string;
	minHeight?: number;
	height?: number;
	maxHeight?: number;
	border?: boolean;
	mt?: number;
	mb?: number;
}
export const CustomPaper: React.FC<ICustomProps> = ({ children, borderColor, minHeight = 121, border, maxHeight, height, mt, mb }) => {
	return (
		<Paper sx={{ backgroundColor: "#fff", borderLeft: border ? 5 : 0, borderLeftColor: borderColor, height, maxHeight, mt, mb  }} variant="elevation">
			<Box minHeight={minHeight} display={'flex'} flexDirection={'column'} p={2}>
				{children}
			</Box>
		</Paper>
	)
}