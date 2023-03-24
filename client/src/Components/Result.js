import { useEffect, useRef, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { FcPrevious, FcNext } from 'react-icons/fc';
import '../Styles/Result.css';

const Result = ({ data, Ref, itemsPerPage, printMode }) => {

    const [currentItems, setCurrentItems] = useState(data.slice(0, itemsPerPage));

    useEffect(() => {
        if(printMode) {
            setCurrentItems(data);
        }
    });

    const handlePageClick = (e) => {
        const start = e.selected * itemsPerPage;
        setCurrentItems(data.slice(start, start + itemsPerPage));
    }

    return ( 
        <div ref={ Ref } className="result">
            <table className="table">
                <thead className="table-head">
                    <tr className="table-row">
                        <td>Protein</td>
                        <td>Site</td>
                        <td className='sequence-column'>Sequence</td>
                        <td>Probability</td>
                    </tr>
                </thead>
                <tbody className="table-body">
                    {
                        currentItems.map((data, index) => {
                            return (
                                <tr className='table-row' key={ index }>
                                    <td>{ data.protein }</td>
                                    <td>{ data.position }</td>
                                    {/* <td>{ data.sequence }</td> */}
                                    {
                                        data.sequence.length < 13
                                            &&
                                        <td className='sequence-column'>{ data.sequence }</td>
                                    }
                                    {
                                        data.sequence.length >= 13
                                            &&
                                        <td className='sequence-column'>{ '...' + data.sequence.substr(data.sequence.length / 2 - 5, 11) + '...' }</td>
                                    }
                                    <td>{ data.probability.toFixed(3) }</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
                <tfoot>
                    
                </tfoot>
            </table>
            {
                    !printMode

                    &&
                    
                    data.length > 5

                    &&

                    
                    <ReactPaginate 
                        breakLabel="..."
                        nextLabel={ <FcNext /> }
                        onPageChange={ handlePageClick }
                        pageRangeDisplayed={ 2 }
                        pageCount={ Math.ceil(data.length / itemsPerPage) }
                        previousLabel={ <FcPrevious /> }
                        renderOnZeroPageCount={ null }
                        activeClassName='active'
                    />
                }
        </div>
    );
}
 
export default Result;
