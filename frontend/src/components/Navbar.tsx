function Navbar() {
    function handleTitleClick() {
        const path = window.location.pathname;
        if (path === '/cars' || path.startsWith('/cars/')) {
            window.location.href = '/cars';
        } else {
            window.location.href = '/login';
        }
    }

    return (
        <div className='navbar !bg-linear-to-t from-[var(--muted)] to-[var(--muted2)]'>
            <strong className="mr-auto pl-3 text-2xl hover:cursor-pointer" onClick={handleTitleClick}>CarStax</strong>
        </div>
    );
}

export default Navbar;