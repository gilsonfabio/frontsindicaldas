import React, { useState, useEffect } from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import moment from 'moment';

import Router, { useRouter } from 'next/router';

import api from './api/api';
import Menubar from '../components/Menubar';

interface vendasProps {
    parId: number;
    parIdCompra: number;
    parNroParcela: number;
    parVctParcela: string;
    parVlrCompra: number;
    parVlrParcela: number;
    parStaParcela: string;
    cmpId: number;
    cmpQtdParcela: number;
    cmpEmissao: string;
    cmpServidor: number;
    cmpConvenio: number;
    cmpVlrCompra: number;
    usrNome: string;
    cnvNomFantasia: string;
}

const RelEmiCnv = () => {
    const router = useRouter();
    const [vendas, setVendas] = useState<Array<vendasProps>>([]);

    const [datInicial, setDatInicial] = useState(router.query.datIni);
    const [datFinal, setDatFinal] = useState(router.query.datFin);

    const [dtInicio, setDtInicio] = useState('');
    const [dtFinal, setDtFinal] = useState('');

    const [cnvNomFantasia, setCnvNomFantasia] = useState('');
    const [cnvId, setIdConvenio] = useState(router.query.id);


    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    
    const {query: { id } } = router

    const reportTitle = [
        {
            text: `Relatório de Vendas por Vencimento periodo de:${dtInicio} a ${dtFinal}`,
            fontSize: 15,
            bold: true,
            margin: [15, 20, 0, 45],
        }       
    ] as any;

    const subTitle = [
        {
            text: `Convênio: ${cnvNomFantasia}`,
            fontSize: 10,
            bold: true,
            margin: [0, 5, 0, 5],
        }       
    ] as any;

    const dados = vendas.map((venda) => {
        return [
            {text: venda.cmpId, fontSize: 9, margin: [0, 2, 0, 2]},
            {text: moment(venda.parVctParcela).utc().locale('pt-br').format('DD-MM-YYYY'), fontSize: 9, margin: [0, 2, 0, 2]},
            {text: venda.usrNome, fontSize: 9, margin: [0, 2, 0, 2]},
            {text: venda.parNroParcela + '/' + venda.cmpQtdParcela, fontSize: 9, margin: [0, 2, 0, 2]},
            {text: Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(venda.parVlrParcela), fontSize: 9, alignment: 'right', margin: [0, 2, 0, 2]}
        ]              
    });

    const totCompras = vendas.map(item => item.parVlrParcela).reduce((prev, curr) => prev + curr, 0);

    const details = [
        {
            table: {
                headerRows: 1,
                widths: [70, 70, 200, 50, 80],
                body: [
                    [
                        {text: 'ID', style: 'tableHeader', fontSize: 10},
                        {text: 'VENCIMENTO', style: 'tableHeader', fontSize: 10},
                        {text: 'NOME SERVIDOR(A)', style: 'tableHeader', fontSize: 10},                        
                        {text: 'PARC/PLANO', style: 'tableHeader', fontSize: 10},
                        {text: 'VLR. DA VENDA', style: 'tableHeader', fontSize: 10},
                    ],
                    ...dados
                ]
            },
            layout: 'headerLineOnly'
        },
    ];

    function Rodape(currentPage:any, pageCount:any){      
        return [  
            {
                columns: [
                    {text: 'Total de Vendas..............' + Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(totCompras), alignment: 'left', fontSize: 10, margin: [10,0,0,0]},
                    {text: 'Página: ' + currentPage + ' / ' + pageCount, alignment: 'right', fontSize: 10, margin: [0,0,20,0] }
                ],
            },                    
        ] as any;
    };

    const docDefinition: TDocumentDefinitions  = {
        pageSize: 'A4',
        pageMargins: [15, 50, 15, 40],
    
        header: [reportTitle],
        content: [subTitle, details],
        footer: Rodape
    };
   
    useEffect(() => {

        setDtInicio(moment(datInicial).utc(true).locale('pt-br').format('DD-MM-YYYY'));
        setDtFinal(moment(datFinal).utc(true).locale('pt-br').format('DD-MM-YYYY'));

        console.log('Convênio: ',cnvId);

        api.get(`pdfVctCmpCnv/${datInicial}/${datFinal}/${cnvId}`).then(resp => {
            setVendas(resp.data);  
            setCnvNomFantasia(resp.data[0].cnvNomFantasia);
        })

    },[]);

    function emitePdf() {
        pdfMake.createPdf(docDefinition).open();       
        //pdfMake.createPdf(docDefinition).download();  
    };
    
    return (
        <div>
           <Menubar />
            <div className="login">
                <div className='flex flex-row justify-center items-center h-56'>
                    <a onClick={emitePdf} className='w-[20%] h-[20%] bg-gray-300 flex flex-row justify-center items-center rounded-lg text-[15px] text-black font-bold mb-0 hover:cursor-pointer hover:bg-gray-600 hover:text-white transition duration-150 ease-in-out'>
                        <div className=''>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                            </svg>
                        </div>
                        <div>
                            <span className='w-[50%] ml-3'>Emite PDF</span>
                        </div>
                    </a>    
                </div>                
            </div>
        </div>
    );
}

export default RelEmiCnv;