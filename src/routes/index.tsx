import {
	Sale,
	Users,
    Stock,
    Groups,
    Page404,
    OutFlow,
    AllSales,
    Products,
    Validity,
    Payments,
    Suppliers,
    Dashboard,
    ShowSales,
    NewProduct,
    NewFincash,
    SaleDetail,
    Promotions,
    AllFincashs,
    EditFincash,
    CloseFincash,
    UpdateProduct,
    OutflowDetail,
    FincashDetail,
    FincashResult,
    ProductOutput,
    PaymentDetail,
} from '../pages';
import { Button } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { useDrawerContext } from '../shared/contexts';

export const AppRoutes = () => {
    const { toggleDrawerOpen } = useDrawerContext();
    return (
        <Routes>
            <Route path="/" element={<Button variant='contained' color='primary' onClick={toggleDrawerOpen}>test</Button>} />
            <Route path="/dashboard" element={<Dashboard />} />9

            {/* Produtos */}
            <Route path="/produtos" element={<Products />} />
            <Route path="/produtos/novo" element={<NewProduct />} />
            <Route path="/produtos/edit/:id" element={<UpdateProduct />} />
            <Route path="/saida/produto" element={<ProductOutput />} />

            {/* Caixa / Vendas */}
            <Route path="/caixa" element={<Sale />} />
            <Route path="/caixa/:id" element={<FincashDetail />} />
            <Route path="/caixa/novo" element={<NewFincash />} />
            <Route path="/vendas" element={<ShowSales />} />
            <Route path="/vendas/caixa/:id" element={<ShowSales />} />
            <Route path="/vendas/:id" element={<SaleDetail />} />
            <Route path="/vendas/admin" element={<AllSales />} />
            <Route path="/caixa/dados/:id" element={<FincashResult />} />
            <Route path="/caixa/editar/:id" element={<EditFincash />} />

            {/* Saidas */}
            <Route path="/saidas" element={<OutFlow />} />
            <Route path="/saidas/:id" element={<OutflowDetail />} />

            {/* Fornecedores */}
            <Route path="/fornecedores" element={<Suppliers />} />

            {/* Fechamentos */}
            <Route path='/fechar' element={<CloseFincash />} />
            <Route path='/fechamentos' element={<AllFincashs />} />

            {/* Grupos */}
            <Route path='/grupos' element={<Groups />} />

            {/* Estoque */}
            <Route path="/estoque" element={<Stock />} />

            {/* Validades */}
            <Route path="/validades" element={<Validity />} />

            {/* Promções */}
            <Route path="/promo" element={<Promotions />} />        
        
            {/* Pagamentos / Boletos */}
            <Route path="/boletos" element={<Payments />} />
            <Route path="/boleto/:id" element={<PaymentDetail />} />
            
			{/* Usuários */}
            <Route path="/usuarios" element={<Users />} />


            {/* Página 404 */}
            <Route path='/*' element={<Page404 />} />

        </Routes>
    );
}