import { useEffect, useRef, useState, Fragment } from 'react';
import ReactToPrint from 'react-to-print';
import { FiUpload } from 'react-icons/fi';
import { BsPrinterFill } from 'react-icons/bs';
import { FaFilePdf, FaFileExcel, FaFileCsv } from 'react-icons/fa';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import exportFromJson from 'export-from-json';
import '../Styles/Server.css';
import Result from './Result';
import Switch from "react-switch";
import { Slider, Select, FormControl, MenuItem, FormGroup, InputLabel } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { findFragments, AAC, DPC, PCP, extractPSSM, extractFeatureMatrix } from '../assets/featureExtraction';
import { mod } from 'mathjs';

const Spinner = require('react-spinkit');

const Server = () => {

    const componentRef = useRef();
    const inputFastaFileElement = useRef(null);
    const textArea = useRef(null);
    const inputPSSMFileElement = useRef(null);

    const [inputData, setInputData] = useState('');
    const [data, setData] = useState(null);
    const [isValidInputData, setIsValidInputData] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [protein, setProtein] = useState(null);
    const [PSSM, setPSSM] = useState(['']);
    const [isInitialRender, setIsInitialRender] = useState(true);
    const [error, setError] = useState(false);
    const [switchTPC, setSwitchTPC] = useState(false);
    const [optionIsActive, setOptionIsActive] = useState(false);
    const [model, setModel] = useState('');
    const [threshold, setThreshold] = useState(0.5);
    const [windowSize, setWindowSize] = useState(5);

    const sliderTheme = createTheme({
        overrides:{
          MuiSlider: {
            thumb:{
            color: "#00b2a9",
            },
            track: {
              color: '#00b2a9'
            },
            rail: {
              color: 'black'
            }
          }
      }
      });

    useEffect(() => {
        if(isInitialRender){
            setIsInitialRender(false);
            return;
        }
        updateStyles();
    }, [isLoading]);

    // Post protein to server after changing [protein] state
    useEffect(() => {
        if(isInitialRender){
            setIsInitialRender(false);
            return;
        }
        let payload;
        if(model == '')
            payload = {Model: 'XGB', FM: protein, Threshold: threshold};
        else
            payload = {Model: model, FM: protein, Threshold: threshold};
        fetch('http://localhost:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if(res.ok) {
                    return res.json();
                }
                throw Error('could not fetch!');
            })
            .then(data => {
                console.log(data);
                setData(data);
                setIsLoading(false);
                updateStyles();
            })
            .catch((error) => {
                if(error.message === 'Failed to fetch'){
                    const errorBox = document.querySelector('.error-box');
                    setError(true);
                    errorBox.classList.add('show');
                    setTimeout(() => {
                        setError(false);
                        errorBox.classList.remove('show');
                    }, 5000);
                }
            });
    }, [protein]);

    // print PSSM after every change
    useEffect(() => {
        if(isInitialRender){
            setIsInitialRender(false);
            return;
        }
        console.log(PSSM);
    }, [PSSM]);

    const chooseFile = () => {
        inputFastaFileElement.current.click();
    }
    const choosePSSMFile = () => {
        inputPSSMFileElement.current.click();
    }
    const updateInputData = () => {
        setInputData(textArea.current.value);
    }

    const validateInputData = () => {
        
        const textarea = document.querySelector('.Server .input-area textarea');
        if(regex.test(inputData)) {
            setIsValidInputData(true);
            textarea.classList.remove('error');
        }
        else {
            setIsValidInputData(false);
            textarea.classList.add('error');
        }
    }
    
    const clearTextAreat = () => {
        textArea.current.value = '';
    }
    const loadFileToTextArea = (e) => {
        const files = e.target.files;
        let reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onload = (e) => {
            textArea.current.value = e.target.result;
        }
        // Error
        //reader.onerror = () => {
        //    console.log('file error', reader.error);
        //}
    }
    const loadPSSMFile = (e) => {
        const files = e.target.files;
        // let reader = new FileReader();

        let temp = [];

        for(let i = 0; i < files.length; i++) {
            let reader = new FileReader();
            reader.readAsText(files[i]);
            reader.onload = (e) => {
                temp.push(e.target.result);
            }
        }

        setPSSM(temp);

        // reader.readAsText(files[0]);
        // reader.onload = (e) => {
        //     setPSSM(e.target.result);
        // }
        // const temp = PSSM.split('\n');
        // for(let i = 0; i < temp.length; i++) {
        //     console.log(temp[i].split(/\s+/));
        // }
        // Error
        //reader.onerror = () => {
        //    console.log('file error', reader.error);
        //}
    }
    const exportData = (data, format) => {
        exportFromJson({data : data, fileName : 'report', exportType : format});
    }
    const updateStyles = () => {

        const resultsElement = document.querySelector('.Server .results');
        const inputArea = document.querySelector('.Server .input-area');

        resultsElement.classList.add('show');

        // resultsElement.animate([
        //     {
        //         width: '65%',
        //         opacity: 1
        //     }
        // ], {
        //     duration: 400,
        //     easing: 'ease-in-out',
        //     fill: 'forwards'
        // });

        if(isLoading) {
            resultsElement.classList.add('loading');
        }
        else {
            resultsElement.classList.remove('loading');
        }
        // inputArea.style.height = '100%';
    }

    const serverMedia = window.matchMedia('(min-width: 940px)');
    // serverMedia.addEventListener("change", e => {

    //     const resultsElement = document.querySelector('.Server .results');
    //     const serverElement = document.querySelector('.Server');
    //     const inputArea = document.querySelector('.Server .input-area');

    //     if(e.matches) {
    //         serverElement.style.display = 'grid';
    //         inputArea.style.width = 'auto';
    //         resultsElement.style.width = 'auto';
    //     }
    //     else {
    //         serverElement.style.display = 'flex';
    //         serverElement.style.flexDirection = 'column';
    //         serverElement.alignItems = 'center';
    //         inputArea.style.width = '450px';
    //         resultsElement.style.width = '450px';
    //     }
    // })

    

    const regex = /^(>sp\|(.)+\n([ARNDCQEGHILKMFPSTWYV](\n)?)*(\n)?)*$/

    return (
        <div className="Server">
            <div className='error-box'>
                Disconnected...
            </div>
            <div className="input-area">
                <input onChange={ (e) => loadFileToTextArea(e) } type="file" id="fasta-file" accept='.fasta' hidden='hidden' ref={ inputFastaFileElement } />
                {/* <button className='btn' onClick={ chooseFile }><FiUpload className='icon upload' />  Upload fasta file</button> */}
                <input onChange={ (e) => loadPSSMFile(e) } type="file" id="pssm-file" accept='.pssm, .csv' hidden='hidden' ref={ inputPSSMFileElement } multiple />
                <button className='btn' onClick={ choosePSSMFile }><FiUpload className='icon upload' />  Upload PSSM</button>
                {/* <p>You can use <a href='https://possum.erc.monash.edu/server.jsp' target='_blank'>POSSUM</a> to generate PSSM.</p> */}
                <p><a href='https://possum.erc.monash.edu/server.jsp' target='_blank'>POSSUM</a></p>
                <div className="text">
                    <textarea onBlur={validateInputData} placeholder='Protein sequence...' name="" id="" ref={ textArea } onChange={ updateInputData }></textarea>
                </div>
                <p>Enter the sequences of proteins in FASTA fromat (<a href='/help' target='_blank'>Example</a>)</p>
                <p>Or <a href='#' onClick={ chooseFile }>upload</a> FASTA file</p>
                <button className='option' onClick={() => {
                    setOptionIsActive(!optionIsActive);
                    const options = document.querySelector('.Server .input-area .options');
                    if(options.classList.contains('show')) {
                        options.classList.remove('show');
                    }
                    else {
                        options.classList.add('show');
                    }
                }}>Options
                {
                    optionIsActive
                        &&
                    <BiChevronUp className='option-is-active'/>
                }
                {
                    !optionIsActive
                        &&
                    <BiChevronDown className='option-is-active'/>
                }
                {/* <BiChevronDown /> */}
                </button>
                <div className='options'>
                    {/* <Switch onChange={() => {setSwitchCheck(!switchCheck)}} checked={switchCheck} checkedIcon={false} uncheckedIcon={false} onColor='#00b2a9' /> */}
                    <FormGroup style={{display: 'flex', margin: '20px'}}>
                        {/* <div style={{display: 'flex', justifyContent: 'space-between', margin: '20px', alignItems: 'flex-end'}}>
                            <label>Tripeptide composition</label>
                            <Switch onChange={() => {setSwitchTPC(!switchTPC)}} checked={switchTPC} checkedIcon={false} uncheckedIcon={false} onColor='#00b2a9' />
                        </div> */}

                        <div style={{display: 'flex', justifyContent: 'center', margin: '20px', alignItems: 'flex-end'}}>
                            <FormControl fullWidth>
                                <InputLabel id="model-select-label">Model</InputLabel>
                                <Select
                                    label='Model'
                                    labelId='model-select-label'
                                    value={ model }
                                    onChange={ (e) => {
                                        setModel(e.target.value);
                                    } }
                                    style={{width: '60%', textAlign: 'center'}}
                                >
                                    <MenuItem value='KNN'>KNN</MenuItem>
                                    <MenuItem value='DNN'>DNN</MenuItem>
                                    <MenuItem value='RF'>RF</MenuItem>
                                    <MenuItem value='DT'>DT</MenuItem>
                                    <MenuItem value='XGB'>XGB</MenuItem>
                                    <MenuItem value='SVM'>SVM</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'space-between', margin: '20px', alignItems: 'flex-end'}}>
                            <FormControl fullWidth>
                                <InputLabel id="window-size-select-label">Window size</InputLabel>
                                <Select
                                    label='window size'
                                    labelId='window-size-select-label'
                                    value={ windowSize }
                                    onChange={ (e) => {
                                        setWindowSize(e.target.value);
                                    } }
                                    style={{width: '60%', textAlign: 'center'}}
                                >
                                    <MenuItem value={ 5 }>5</MenuItem>
                                    <MenuItem value={ 7 }>7</MenuItem>
                                    <MenuItem value={ 9 }>9</MenuItem>
                                    <MenuItem value={ 11 }>11</MenuItem>
                                    <MenuItem value={ 13 }>13</MenuItem>
                                    <MenuItem value={ 15 }>15</MenuItem>
                                    <MenuItem value={ 17 }>17</MenuItem>
                                    <MenuItem value={ 19 }>19</MenuItem>
                                    <MenuItem value={ 21 }>21</MenuItem>
                                    <MenuItem value={ 23 }>23</MenuItem>
                                    <MenuItem value={ 25 }>25</MenuItem>
                                    <MenuItem value={ 27 }>27</MenuItem>
                                    <MenuItem value={ 29 }>29</MenuItem>
                                    <MenuItem value={ 31 }>31</MenuItem>
                                    <MenuItem value={ 33 }>33</MenuItem>
                                    <MenuItem value={ 35 }>35</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'space-between', margin: '20px'}}>
                            <label>Threshold</label>
                            <div style={{width:'60%'}}>
                                <ThemeProvider theme={sliderTheme}>
                                    <Slider
                                        // color=''
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={threshold}
                                        valueLabelDisplay="auto"
                                        onChange={(e, value) => {
                                            setThreshold(value);
                                        }}
                                        
                                    />
                                </ThemeProvider>
                            </div>
                        </div>
                    </FormGroup>
                    
                </div>
                <input  className='btn' type="submit" value="Submit" onClick={ () => {
                    if(true){
                        setIsLoading(true);
                        // updateStyles();
                        // setTimeout(() => {
                            // const splittedData = inputData.split(/>sp\|P[0-9]{5}(.)+\n/g);
                            const splittedData = inputData.split(/>sp\|(.)+\n/g);
                            const temp= [];
                            for(let i = 2; i < splittedData.length; i+=2) {
                                const sequence = splittedData[i].replaceAll('\n', '')
                                temp.push({
                                    // number: i / 2,
                                    sequence: sequence,
                                    fragments: findFragments(sequence.replace(/^/, 'XX').replace(/$/, 'XX'), PSSM, windowSize, i / 2 - 1)
                                });
                            }
                            // temp.push(PSSM);
                            temp.push(inputData);
                            temp.push(extractFeatureMatrix(temp));
                            setProtein(temp);

                            // console.log(protein);

                            // fetch('http://localhost:5000/', {
                            //     method: 'POST',
                            //     headers: { 'Content-Type': 'application/json' },
                            //     body: JSON.stringify(protein)
                            // })
                            //     .then(res => res.json())
                            //     .then(data => {
                            //         console.log(data);
                            //         setData(data);
                            //         setIsLoading(false);
                            //         updateStyles();
                            //     });
                        // }, 3000);
                    }
                    
                    // setIsLoading(!isLoading);
                    // updateStyles();
                } }/>
                {/* <button onClick={ clearTextAreat } className="btn">Clear</button>
                <label>Threshold : </label>
                <select name="" id="">
                    <option value="0.1">0.1</option>
                    <option value="0.25">0.25</option>
                    <option value="0.5">0.5</option>
                    <option value="0.75">0.75</option>
                    <option value="0.9">0.9</option>
                </select> */}
            </div>
            <div className="results">
                {/* { !isValidInputData && <p>Invalid inputs!</p> } */}
                {
                    isLoading
                        &&
                    <Spinner name="folding-cube" color="#003B5C" fadeIn='none'/>
                }
                {
                    !isLoading
                        &&
                    data
                        &&
                    <>
                        <Result data={ data } itemsPerPage={ 8 } printMode={ false } />
                        {/* print */}
                        <div hidden>
                            <Result Ref={ componentRef } data={ data } itemsPerPage={ 5 } printMode={ true } />
                        </div>
                        <div className='export'>
                            <ReactToPrint
                                trigger={() => <BsPrinterFill className='icon printer' />}
                                content={() => componentRef.current}
                                documentTitle='Print results'
                            />
                            <FaFilePdf className='icon pdf'/>
                            <FaFileExcel className='icon excel' onClick={ () => exportData(data, 'xls') }/>
                            <FaFileCsv className='icon csv' onClick={ () => exportData(data, 'csv') }/>
                        </div>
                    </>
                }
            </div>
        </div>
    );
}

export default Server;