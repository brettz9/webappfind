function aTest () {
    'use asm';
    function f() {
        var x = 0, y = 0;
        x = (x|0)%(y|0);
    }
    return f;
}
