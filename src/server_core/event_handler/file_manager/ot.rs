struct operation
{
    bool
}

struct docState {
    
}
    constructor(string) {
        this.ops = [];
        this.dels = null;
        if(string){ this.str = string; } else { this.str = ""; }
        this.points = [];  // in user-visible string coordinates
    }

    add(op) {
        this.ops.push(op);
        if (op.ty == 'del') {
            if (!contains(this.dels, op.ix)) {
                var ix = xi_inv(this.dels, op.ix);
                this.dels = union_one(this.dels, op.ix);
                this.str = this.str.slice(0, ix) + this.str.slice(ix + 1);
                for (var i = 0; i < this.points.length; i++) {
                    if (this.points[i] > ix) {
                        this.points[i] -= 1;
                    }
                }
            }
        } else if (op.ty == 'ins') {
            this.dels = xi_one(this.dels, op.ix);
            var ix = xi_inv(this.dels, op.ix);
            this.str = this.str.slice(0, ix) + op.ch + this.str.slice(ix);
            for (var i = 0; i < this.points.length; i++) {
                if (this.points[i] > ix) {
                    this.points[i] += 1;
                }
            }
        }
    }

    xform_ix(ix) {
        return xi(this.dels, ix);
    }

    get_str() {
        return this.str;
    }
}