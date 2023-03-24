import '../Styles/Help.css';
const Help = () => {
    return (
        <div className="Help">
            <div style={{display: 'flex', justifyContent: 'center', boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px', padding: '20px'}}>
                <ol style={{width: '300px', textAlign: 'justify', margin: '0 50px', padding: '5px'}}>
                    <li>
                        Each protein sequence must start with a ">" symbol in the first column. The words right after the ">" symbol in the single initial line are optional and only used for the purpose of identification and description.
                    </li>
                    <li>
                        The accepted characters are: A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y, and the dummy code X.
                    </li>
                </ol>
                <div className="fasta-example">
                    <pre>
                        >sp|P00000|DEFGA_MYTGA Defensin gallicin OS=Mytilus galloprovincialis OX=29158 PE=1 SV=1<br/>
                        MWIESDAGVAIDRHARGACSLGEAGCATYCFYQGKHHGGCCGENYTKCLGTCYCNGSGYEYRCHSCDL
                    </pre>
                    <pre>
                        >sp|P12345|AATM_RABIT Aspartate aminotransferase, mitochondrial OS=Oryctolagus cuniculus OX=9986 GN=GOT2 PE=1 SV=2<br/>
                        MALLHSARVLSGVASAFHPGLAAAASARASSWWAHVEMGPPDPILGVTEAYKRDTNSKKMNLGVGAYRDDNGKPYVLPSVRKAEAQIAAKGLDKEYLPIGGLAEFCRASAELALGENSEVVKSGRFVTVQTISGTGALRIGASFLQRFFKFSRDVFLPKPSWGNHTPIFRDAGMQLQSYRYYDPKTCGFDFTGALEDISKIPEQSVLLLHACAHNPTGVDPRPEQWKEIATVVKKRNLFAFFDMAYQGFASGDGDKDAWAVRHFIEQGINVCLCQSYAKNMGLYGERVGAFTVICKDADEAKRVESQLKILIRPMYSNPPIHGARIASTILTSPDLRKQWLQEVKGMADRIIGMRTQLVSNLKKEGSTHSWQHITDQIGMFCFTGLKPEQVERLTKEFSIYMTKDGRISVAGVTSGNVGYLAHAIHQVTK
                    </pre>
                </div>
            </div>   
        </div>
    );
}

export default Help;