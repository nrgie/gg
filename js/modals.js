
var modals = {
    
    simple_two_btn: util.multiline(function(){
    /*
        <div class="modal" id="modal-sample"  tabindex="-1" role="dialog" aria-labelledby="modal-sample-label" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="modal-sample-label">
                            <?=title?>
                        </h4>
                    </div>
                    <div class="modal-body">
                        <?=message?>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary data-yes"><?=yes?></button>
                        <button type="button" class="btn btn-info data-no" data-dismiss="modal"><?=no?></button>
                    </div>
                </div>
            </div>
        </div>
    */
    }),
    
    simple_one_btn: util.multiline(function(){
    /*
        <div class="modal" id="modal-sample"  tabindex="-1" role="dialog" aria-labelledby="modal-sample-label" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title" id="modal-sample-label">
                            <?=title?>
                        </h4>
                    </div>
                    <div class="modal-body">
                        <?=message?>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary data-no" data-dismiss="modal"><?=yes?></button>
                    </div>
                </div>
            </div>
        </div>
    */
    })

}