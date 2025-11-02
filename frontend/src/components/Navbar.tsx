function Navbar() {
    function handleTitleClick() {
        window.location.href = '/cars';
    }

    return (
        <div className='navbar !bg-linear-to-t from-[var(--muted)] to-[var(--muted2)]'>
            <strong className="mr-auto pl-3 text-2xl hover:cursor-pointer" onClick={handleTitleClick}>CarStax</strong>
        </div>
    );
}

export default Navbar;