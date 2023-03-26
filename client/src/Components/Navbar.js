import '../Styles/Navbar.css';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { AiOutlineCloudServer } from 'react-icons/ai';
import { MdListAlt, MdHelpOutline, MdDownload } from 'react-icons/md';
import { useEffect, useRef } from 'react';
const Navbar = () => {
    const homeRef = useRef();
    const serverRef = useRef();
    const HelpRef = useRef();
    const aboutRef = useRef();
    const contactRef = useRef();
    const downloadRef = useRef();

    useEffect(() => {
        const url = window.location.pathname;
        if(url === '/' || url === '/home') {
            homeRef.current.classList.add('current');
        }
        else if(url === '/server') {
            serverRef.current.classList.add('current');
        }
        else if(url === '/about') {
            aboutRef.current.classList.add('current');
        }
        else if(url === '/contact') {
            contactRef.current.classList.add('current');
        }
        else if(url === '/help') {
            HelpRef.current.classList.add('current');
        }
    }, []);

    const updateCurrent = (e) => {
        const current = document.querySelector('.current');
        current.classList.remove('current');
        e.classList.add('current');
    }
    return (
        <nav className="navbar">
            <ul>
                <li ref = { homeRef }  onClick={ () => updateCurrent(homeRef.current) }>
                    <Link to="/"><FaHome className='nav-logo'/><span>Home</span></Link>
                </li>
                <li ref={ serverRef } onClick={ () => updateCurrent(serverRef.current) }>
                    <Link to="/server"><AiOutlineCloudServer className='nav-logo' /><span>Server</span></Link>
                </li>
                <li ref={ HelpRef } onClick={ () => updateCurrent(HelpRef.current) }>
                    <Link to="/help"><MdHelpOutline className='nav-logo'/><span>Help</span></Link>
                </li>
                <li ref={ downloadRef } onClick={ () => updateCurrent(downloadRef.current) }>
                    <Link to="/download"><MdDownload className='nav-logo'/><span>Download</span></Link>
                </li>
                <li ref={ aboutRef } onClick={ () => updateCurrent(aboutRef.current) }>
                    <Link to="/about">About</Link>
                </li>
                <li ref={ contactRef } onClick={ () => updateCurrent(contactRef.current) }>
                    <Link to="/contact">Contact</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;